[README_ODOO.md](https://github.com/user-attachments/files/26330685/README_ODOO.md)
# ReimburseIQ

A full-stack expense reimbursement system built for the **Odoo × VIT Pune Hackathon 2026**.

The problem companies actually have isn't just "no software" — it's that existing tools don't support flexible approval logic. Someone submits a ₹50,000 travel claim and it either sits in a manager's inbox forever or gets auto-approved with zero oversight. We built something that handles the in-between: configurable multi-step approvals, conditional rules, and full visibility for everyone involved.

---

<img width="917" height="466" alt="image" src="https://github.com/user-attachments/assets/b61181b8-adcc-443a-9071-7c2e3cdf276e" />

---

## What it does

**For employees** — submit an expense in any currency. Attach a receipt. If you're in a hurry, hit "Scan Receipt" and let the OCR pull out the amount, date, vendor, and category automatically. Then just submit.

**For managers** — you get a queue. Open an expense, see the full approval chain, approve or reject with a comment. The next approver gets notified. You never touch something twice.

**For admins** — you set up the rules. Want Finance to sign off on anything over ₹25,000, but only after the employee's manager has already approved? That's two clicks. Want the CFO's approval to bypass everything else? Also two clicks.

The system handles four approval modes:

| Mode | Behaviour |
|------|-----------|
| Sequential | Every approver in order, no shortcuts |
| Percentage | 60% approve → done, no need to wait for the rest |
| Specific | If the CFO approves, it's approved regardless of anyone else |
| Hybrid | 60% OR the CFO — whichever happens first |

These can also stack with the manager-first flag, which sends the expense to the employee's direct manager before any of the above rules kick in.

---

## Stack

- **Frontend:** React 18, Context API, custom CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (integer PKs, proper FK constraints)
- **Auth:** JWT + bcrypt
- **OCR:** Claude Vision API
- **Currency conversion:** ExchangeRate API with DB-cached fallback
- **Country/currency list:** REST Countries API

Nothing exotic. The only slightly unconventional choice is using Claude's vision model for receipt scanning instead of Tesseract — the accuracy difference on real-world receipts is significant enough that it's worth the API call.

---

## Getting started

You'll need Node 18+, PostgreSQL 14+, and API keys for Claude and ExchangeRate.

```bash
git clone https://github.com/your-team/reimburseiq.git
cd reimburseiq
```

**Backend setup:**

```bash
npm install
cp .env.example .env   # fill in your values
psql -U postgres -c "CREATE DATABASE reimburseiq;"
psql -U postgres -d reimburseiq -f db/schema.sql
node server.js
```

**Frontend setup:**

```bash
cd client
npm install
npm start
```

App runs on `http://localhost:3000`, API on `http://localhost:8000`.

---

## Environment variables

```env
PORT=8000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=reimburseiq
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=pick_something_long_and_random

ANTHROPIC_API_KEY=sk-ant-...
EXCHANGERATE_API_KEY=your_key_here
```

---

## Project structure

```
reimburseiq/
├── server.js              # Express entry point
├── db.js                  # PostgreSQL pool (pg)
├── routes/
│   └── auth.js            # /register /login /me /countries
│
└── client/
    └── src/
        ├── api.js                  # All API calls in one place
        ├── App.js                  # Route switching + auth guard
        ├── context/
        │   └── AuthContext.js      # user, token, login(), logout()
        ├── components/
        │   └── Navbar.js           # Role-aware nav
        └── pages/
            ├── Login.js
            ├── Register.js         # Creates company + admin on submit
            ├── Dashboard.js        # Stats overview, quick links
            ├── Expenses.js         # Submit, view, filter expenses
            ├── ApprovalQueue.js    # Pending queue + history + decide modal
            ├── Users.js            # Admin: create/edit users and roles
            └── Rules.js            # Admin: build approval rules visually
```

---

## Database schema

```sql
companies        (id, name, country, currency_code, created_at)
users            (id, company_id, name, email, password_hash, role, manager_id, is_active)
categories       (id, company_id, name)
approval_rules   (id, company_id, name, description, condition_type,
                  is_manager_first, min_amount, max_amount,
                  percentage_threshold, specific_approver_id, category_id)
approval_steps   (id, rule_id, step_order, approver_user_id, is_required)
expenses         (id, employee_id, rule_id, amount, currency,
                  amount_company_currency, category_id, description,
                  expense_date, receipt_url, status, submitted_at)
expense_approvals (id, expense_id, step_order, approver_id,
                   is_manager_step, status, comment, decided_at)
audit_logs       (id, expense_id, actor_id, action, meta, created_at)
```

Integer PKs across the board — index size is roughly 9× smaller than UUID which matters once you're doing approval chain lookups across a few thousand expenses.

---

## Approval flow

<img width="1038" height="533" alt="image" src="https://github.com/user-attachments/assets/0e59910b-daf0-47bd-b3e1-37ef7d295f39" />

The engine runs after every approver action. It checks the condition, decides if the expense should advance to the next step or resolve early, and logs every state change to `audit_logs`. Rejections anywhere in the chain end it immediately.

---

## API overview

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /register` `POST /login` `GET /me` `GET /countries` |
| Users | `GET /users` `GET /users/managers` `POST /users` `PATCH /users/:id` |
| Expenses | `GET /expenses` `GET /expenses/:id` `POST /expenses` `POST /expenses/:id/submit` `DELETE /expenses/:id` `GET /expenses/stats/summary` |
| Approvals | `GET /approvals/queue` `GET /approvals/history` `GET /approvals/all` `POST /approvals/:id/decide` |
| Rules | `GET /rules` `POST /rules` `PUT /rules/:id` `DELETE /rules/:id` |
| Categories | `GET /categories` `POST /categories` `DELETE /categories/:id` |
| OCR | `POST /ocr/scan` `POST /ocr/:id/confirm` |

---

## Demo accounts

Seed the DB with `node db/seed.js` (company: Acme Corp, currency: INR).

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acmecorp.com | demo1234 |
| Manager | manager@acmecorp.com | demo1234 |
| Finance | finance@acmecorp.com | demo1234 |
| Employee | employee@acmecorp.com | demo1234 |

---
### Working Screenshots:
<img width="1919" height="901" alt="Screenshot 2026-03-29 170029" src="https://github.com/user-attachments/assets/f6ae10fd-050f-406d-871e-05b6d03640f9" />
<img width="1902" height="865" alt="Screenshot 2026-03-29 170100" src="https://github.com/user-attachments/assets/381c8a5a-39a7-4aa9-94c2-781e0ee3b021" />
<img width="1912" height="888" alt="Screenshot 2026-03-29 170148" src="https://github.com/user-attachments/assets/31fa15c4-0a56-48f8-86c9-a3a2601c7549" />
<img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/243efa78-5fb2-4894-81ac-8b4b3e4f215c" />

---

---

## Team

| Name | What they built |
|------|----------------|
| Member 1 | Backend — auth, users, company setup, countries API |
| Member 2 | Backend — approval engine, currency conversion, audit trail |
| Member 3 | Frontend — expense submission, OCR flow, manager approval UI |
| Member 4 | Frontend — admin panel, rule builder, dashboard, CSS |

---

Built in 24 hours. Odoo × VIT Pune Hackathon 2026.
