-- =============================================================================
-- Reimbursement Management System — PostgreSQL Schema
-- =============================================================================
-- Conventions:
--   • All PKs are gen_random_uuid() (pgcrypto not required — pg 13+)
--   • Timestamps are TIMESTAMPTZ (timezone-aware)
--   • Soft-delete via is_active / status columns, not physical DELETE
--   • updated_at is maintained by a shared trigger function
--   • NUMERIC(15,4) for money, NUMERIC(15,6) for exchange rates
--   • All ENUMs are declared as PG TYPE for type safety + index efficiency
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid() on PG < 13
-- On PG 13+ gen_random_uuid() is built-in; pgcrypto is still harmless to add.


-- ---------------------------------------------------------------------------
-- 0a. Shared trigger: auto-update updated_at column
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- MODULE 1 — IDENTITY & TENANT
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1.1  companies
-- ---------------------------------------------------------------------------

CREATE TABLE companies (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255)  NOT NULL,
  country_code     VARCHAR(10)   NOT NULL,          -- ISO 3166-1 alpha-2, e.g. 'IN'
  default_currency VARCHAR(10)   NOT NULL,          -- ISO 4217, e.g. 'INR'
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON COLUMN companies.default_currency
  IS 'Populated from https://restcountries.com/v3.1/all?fields=name,currencies at signup';


-- ---------------------------------------------------------------------------
-- 1.2  users
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role   NOT NULL DEFAULT 'employee',
  -- Self-referential: employee → their direct manager
  manager_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_company_email UNIQUE (company_id, email)
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Prevent a user from being their own manager
ALTER TABLE users
  ADD CONSTRAINT chk_users_no_self_manager CHECK (id != manager_id);

CREATE INDEX idx_users_company_role    ON users (company_id, role)      WHERE is_active = TRUE;
CREATE INDEX idx_users_manager         ON users (manager_id)            WHERE manager_id IS NOT NULL;

COMMENT ON COLUMN users.manager_id
  IS 'Direct reporting manager. Used for is_manager_first approval step.';


-- =============================================================================
-- MODULE 2 — EXPENSE CATEGORIES
-- =============================================================================

CREATE TABLE expense_categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID        NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  name       VARCHAR(100) NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_category_company_name UNIQUE (company_id, name)
);

CREATE INDEX idx_categories_company ON expense_categories (company_id) WHERE is_active = TRUE;


-- =============================================================================
-- MODULE 3 — APPROVAL RULES ENGINE
-- =============================================================================

CREATE TYPE approval_condition_type AS ENUM (
  'SEQUENTIAL',       -- each approver in order, all must approve
  'PERCENTAGE',       -- X% of approvers must approve
  'SPECIFIC',         -- if a specific approver approves → auto-approved
  'HYBRID'            -- PERCENTAGE OR SPECIFIC, whichever fires first
);

-- ---------------------------------------------------------------------------
-- 3.1  approval_rules
-- ---------------------------------------------------------------------------

CREATE TABLE approval_rules (
  id                   UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID                   NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  name                 VARCHAR(255)           NOT NULL,
  description          TEXT,

  -- Scope: optionally restrict rule to a specific category (NULL = all)
  category_id          UUID                   REFERENCES expense_categories(id) ON DELETE SET NULL,

  -- Amount threshold (in company's default currency)
  min_amount           NUMERIC(15,4)          NOT NULL DEFAULT 0,
  max_amount           NUMERIC(15,4),         -- NULL = no upper cap

  -- Approval sequence config
  is_manager_first     BOOLEAN                NOT NULL DEFAULT FALSE,
  condition_type       approval_condition_type NOT NULL DEFAULT 'SEQUENTIAL',

  -- PERCENTAGE / HYBRID
  percentage_threshold NUMERIC(5,2),          -- e.g. 60.00 means 60%

  -- SPECIFIC / HYBRID
  specific_approver_id UUID                   REFERENCES users(id) ON DELETE SET NULL,

  is_active            BOOLEAN                NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_rule_amount_range
    CHECK (max_amount IS NULL OR max_amount >= min_amount),

  CONSTRAINT chk_rule_percentage_range
    CHECK (percentage_threshold IS NULL
           OR (percentage_threshold > 0 AND percentage_threshold <= 100))
);

CREATE TRIGGER trg_approval_rules_updated_at
  BEFORE UPDATE ON approval_rules
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Used by the backend when matching an incoming expense to the right rule
CREATE INDEX idx_rules_company_active    ON approval_rules (company_id, is_active);
CREATE INDEX idx_rules_amount_threshold  ON approval_rules (company_id, min_amount, max_amount);
CREATE INDEX idx_rules_category          ON approval_rules (category_id) WHERE category_id IS NOT NULL;

COMMENT ON COLUMN approval_rules.is_manager_first
  IS 'If TRUE, the employee''s direct manager must approve before the rule step chain begins (step_order = 0).';

COMMENT ON COLUMN approval_rules.percentage_threshold
  IS 'Required for PERCENTAGE and HYBRID condition types. Defines % of approvers needed.';

COMMENT ON COLUMN approval_rules.specific_approver_id
  IS 'Required for SPECIFIC and HYBRID types. If this user approves, expense is immediately approved.';


-- ---------------------------------------------------------------------------
-- 3.2  approval_rule_steps  (ordered approver chain per rule)
-- ---------------------------------------------------------------------------

CREATE TABLE approval_rule_steps (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id          UUID        NOT NULL REFERENCES approval_rules(id) ON DELETE CASCADE,
  step_order       SMALLINT    NOT NULL,   -- 1, 2, 3… (0 is reserved for manager step)
  approver_user_id UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_required      BOOLEAN     NOT NULL DEFAULT TRUE,  -- FALSE = optional in HYBRID
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_rule_step_order  UNIQUE (rule_id, step_order),
  CONSTRAINT chk_step_order_pos  CHECK  (step_order >= 1)
);

CREATE INDEX idx_rule_steps_rule ON approval_rule_steps (rule_id, step_order);


-- =============================================================================
-- MODULE 4 — EXPENSES & APPROVAL TRACKING
-- =============================================================================

CREATE TYPE expense_status AS ENUM (
  'DRAFT',        -- saved but not submitted
  'PENDING',      -- submitted, awaiting approvals
  'APPROVED',     -- fully approved
  'REJECTED',     -- rejected at any step
  'CANCELLED'     -- withdrawn by employee
);

-- ---------------------------------------------------------------------------
-- 4.1  expenses
-- ---------------------------------------------------------------------------

CREATE TABLE expenses (
  id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID            NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  employee_id             UUID            NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
  category_id             UUID            NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,

  description             TEXT            NOT NULL,
  expense_date            DATE            NOT NULL,

  -- Dual-currency storage
  amount                  NUMERIC(15,4)   NOT NULL,           -- as submitted by employee
  currency                VARCHAR(10)     NOT NULL,           -- ISO 4217 of submitted amount
  exchange_rate           NUMERIC(15,6)   NOT NULL DEFAULT 1, -- rate at submission time
  amount_company_currency NUMERIC(15,4)   NOT NULL,           -- amount * exchange_rate

  -- Receipt
  receipt_url             VARCHAR(500),                       -- S3 / storage path; set by OCR flow or direct upload

  -- Status & workflow state
  status                  expense_status  NOT NULL DEFAULT 'DRAFT',
  applied_rule_id         UUID            REFERENCES approval_rules(id) ON DELETE SET NULL,
  current_step            SMALLINT        NOT NULL DEFAULT 0, -- pointer into approval step chain

  submitted_at            TIMESTAMPTZ,                        -- NULL while DRAFT
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_expense_amount_positive        CHECK (amount > 0),
  CONSTRAINT chk_expense_company_currency_pos   CHECK (amount_company_currency > 0),
  CONSTRAINT chk_expense_exchange_rate_pos      CHECK (exchange_rate > 0),
  CONSTRAINT chk_expense_submitted_at_pending   CHECK (
    (status = 'DRAFT' AND submitted_at IS NULL) OR
    (status != 'DRAFT' AND submitted_at IS NOT NULL)
  )
);

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Core query patterns
CREATE INDEX idx_expenses_employee_status ON expenses (employee_id, status);
CREATE INDEX idx_expenses_company_status  ON expenses (company_id,  status);
CREATE INDEX idx_expenses_submitted_at    ON expenses (company_id,  submitted_at DESC) WHERE status = 'PENDING';
CREATE INDEX idx_expenses_applied_rule    ON expenses (applied_rule_id) WHERE applied_rule_id IS NOT NULL;

COMMENT ON COLUMN expenses.applied_rule_id
  IS 'Locked at submission time. Rule changes do not affect in-flight expenses.';

COMMENT ON COLUMN expenses.exchange_rate
  IS 'Snapshot from https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY} at submission. Never recalculated.';

COMMENT ON COLUMN expenses.current_step
  IS 'State machine pointer. 0 = manager step (if is_manager_first=true), 1+ = rule steps.';


-- ---------------------------------------------------------------------------
-- 4.2  expense_approval_steps  (immutable audit log of every decision)
-- ---------------------------------------------------------------------------

CREATE TYPE approval_step_status AS ENUM (
  'PENDING',    -- waiting for this approver
  'APPROVED',   -- approver approved
  'REJECTED',   -- approver rejected (terminal)
  'SKIPPED'     -- bypassed (e.g. SPECIFIC approver fired, remaining steps skipped)
);

CREATE TABLE expense_approval_steps (
  id              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id      UUID                 NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id     UUID                 NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
  step_order      SMALLINT             NOT NULL,        -- mirrors rule step_order (0 = manager)
  is_manager_step BOOLEAN              NOT NULL DEFAULT FALSE,
  status          approval_step_status NOT NULL DEFAULT 'PENDING',
  comment         TEXT,                                 -- approver's rejection/approval note
  decided_at      TIMESTAMPTZ,                          -- NULL while PENDING
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW()

  -- No updated_at — rows are immutable once decided
);

-- Manager queue: "show me all expenses waiting on me"
CREATE INDEX idx_appr_steps_approver_pending
  ON expense_approval_steps (approver_id, status)
  WHERE status = 'PENDING';

-- Workflow engine: "what are the steps for this expense, in order?"
CREATE INDEX idx_appr_steps_expense_order
  ON expense_approval_steps (expense_id, step_order);

COMMENT ON TABLE expense_approval_steps
  IS 'Append-only audit log. One row per approver per expense. Never physically updated.';


-- =============================================================================
-- MODULE 5 — OCR & RECEIPT DATA
-- =============================================================================

CREATE TYPE ocr_status AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

CREATE TABLE receipt_ocr_data (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nullable FK: set AFTER employee confirms autofill and expense is created
  expense_id           UUID          REFERENCES expenses(id) ON DELETE SET NULL,

  raw_image_url        VARCHAR(500)  NOT NULL,

  -- Extracted fields (all nullable — OCR may partially fail)
  extracted_amount     NUMERIC(15,4),
  extracted_currency   VARCHAR(10),
  extracted_date       DATE,
  extracted_description TEXT,
  extracted_vendor     VARCHAR(255),             -- e.g. restaurant name
  extracted_category   VARCHAR(100),             -- suggested match, not yet a FK

  -- Confidence: 0.00–100.00; drives whether UI autofills silently or prompts user
  confidence_score     NUMERIC(5,2),

  ocr_status           ocr_status    NOT NULL DEFAULT 'PENDING',
  error_message        TEXT,                     -- populated on FAILED

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ocr_confidence_range
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100))
);

CREATE TRIGGER trg_ocr_updated_at
  BEFORE UPDATE ON receipt_ocr_data
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_ocr_expense    ON receipt_ocr_data (expense_id)  WHERE expense_id IS NOT NULL;
CREATE INDEX idx_ocr_status     ON receipt_ocr_data (ocr_status)  WHERE ocr_status IN ('PENDING', 'PROCESSING');

COMMENT ON COLUMN receipt_ocr_data.expense_id
  IS 'NULL until employee confirms OCR autofill. Background job creates the expense and sets this FK.';

COMMENT ON COLUMN receipt_ocr_data.extracted_category
  IS 'Raw text from OCR. Backend matches to expense_categories.name after confirmation.';


-- =============================================================================
-- VIEWS (convenience — no business logic)
-- =============================================================================

-- Pending approvals for a manager — used directly by the manager queue endpoint
CREATE VIEW v_pending_approvals AS
SELECT
  eas.id                        AS step_id,
  eas.approver_id,
  eas.step_order,
  eas.is_manager_step,
  e.id                          AS expense_id,
  e.company_id,
  e.employee_id,
  e.description,
  e.expense_date,
  e.amount,
  e.currency,
  e.amount_company_currency,
  c.default_currency            AS company_currency,
  ec.name                       AS category_name,
  e.submitted_at,
  e.receipt_url
FROM   expense_approval_steps eas
JOIN   expenses           e   ON e.id  = eas.expense_id
JOIN   companies          c   ON c.id  = e.company_id
JOIN   expense_categories ec  ON ec.id = e.category_id
WHERE  eas.status  = 'PENDING'
  AND  e.status    = 'PENDING';

-- Employee expense history with final status
CREATE VIEW v_employee_expense_history AS
SELECT
  e.id,
  e.employee_id,
  e.company_id,
  e.description,
  e.expense_date,
  e.amount,
  e.currency,
  e.amount_company_currency,
  ec.name   AS category_name,
  e.status,
  e.submitted_at,
  e.created_at
FROM   expenses           e
JOIN   expense_categories ec ON ec.id = e.category_id;


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
