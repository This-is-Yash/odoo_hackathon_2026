import React, { useEffect, useState } from "react";
import { getRules, createRule, updateRule, deleteRule, getUsers, getCategories } from "../api";

const CONDITION_TYPES = [
  { value: "SEQUENTIAL", label: "Sequential", desc: "All approvers must approve in order" },
  { value: "PERCENTAGE", label: "Percentage", desc: "X% of approvers must approve" },
  { value: "SPECIFIC", label: "Specific", desc: "If a specific person approves → auto-approved" },
  { value: "HYBRID", label: "Hybrid", desc: "Percentage OR specific approver (whichever first)" },
];

function RuleModal({ allUsers, categories, onClose, onSaved, editing }) {
  const [form, setForm] = useState(editing || {
    name: "", description: "", category_id: "",
    min_amount: 0, max_amount: "",
    is_manager_first: false,
    condition_type: "SEQUENTIAL",
    percentage_threshold: "", specific_approver_id: "",
    steps: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const addStep = () => {
    const nextOrder = form.steps.length > 0 ? Math.max(...form.steps.map((s) => s.step_order)) + 1 : 1;
    setForm({ ...form, steps: [...form.steps, { step_order: nextOrder, approver_user_id: "", is_required: true }] });
  };

  const removeStep = (idx) => {
    const steps = form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 }));
    setForm({ ...form, steps });
  };

  const updateStep = (idx, field, value) => {
    const steps = [...form.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setForm({ ...form, steps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        max_amount: form.max_amount || null,
        category_id: form.category_id || null,
        specific_approver_id: form.specific_approver_id || null,
        percentage_threshold: form.percentage_threshold || null,
      };
      if (editing) await updateRule(editing.id, payload);
      else await createRule(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const needsPct = ["PERCENTAGE", "HYBRID"].includes(form.condition_type);
  const needsSpecific = ["SPECIFIC", "HYBRID"].includes(form.condition_type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Rule" : "New Approval Rule"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Rule Name</label>
              <input name="name" className="field-input" placeholder="e.g. High-Value Travel" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="field-label">Category (leave blank = all)</label>
              <select name="category_id" className="field-input" value={form.category_id || ""} onChange={handleChange}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Description (optional)</label>
            <input name="description" className="field-input" placeholder="What does this rule do?" value={form.description || ""} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Min Amount ({editing?.currency || "Company Currency"})</label>
              <input name="min_amount" type="number" min="0" step="0.01" className="field-input" value={form.min_amount} onChange={handleChange} />
            </div>
            <div className="field-group">
              <label className="field-label">Max Amount (blank = no cap)</label>
              <input name="max_amount" type="number" min="0" step="0.01" className="field-input" placeholder="∞" value={form.max_amount || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="field-group">
            <label className="checkbox-label">
              <input type="checkbox" name="is_manager_first" checked={form.is_manager_first} onChange={handleChange} />
              <span>Require manager approval first (Step 0)</span>
            </label>
          </div>

          <div className="form-section-title">Condition Type</div>
          <div className="condition-grid">
            {CONDITION_TYPES.map((ct) => (
              <div
                key={ct.value}
                className={`condition-card ${form.condition_type === ct.value ? "condition-active" : ""}`}
                onClick={() => setForm({ ...form, condition_type: ct.value })}
              >
                <div className="condition-label">{ct.label}</div>
                <div className="condition-desc">{ct.desc}</div>
              </div>
            ))}
          </div>

          {needsPct && (
            <div className="field-group">
              <label className="field-label">Percentage Threshold (%)</label>
              <input
                name="percentage_threshold"
                type="number"
                min="1"
                max="100"
                className="field-input"
                placeholder="e.g. 60"
                value={form.percentage_threshold || ""}
                onChange={handleChange}
                required={needsPct}
              />
            </div>
          )}

          {needsSpecific && (
            <div className="field-group">
              <label className="field-label">Specific Approver</label>
              <select name="specific_approver_id" className="field-input" value={form.specific_approver_id || ""} onChange={handleChange} required={needsSpecific}>
                <option value="">Select approver</option>
                {allUsers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          )}

          <div className="form-section-title">
            Approver Steps
            <button type="button" className="btn btn-sm btn-ghost" onClick={addStep}>+ Add Step</button>
          </div>

          {form.steps.length === 0 ? (
            <div className="empty-steps">No steps added. Click "+ Add Step" to build the approval chain.</div>
          ) : (
            <div className="steps-list">
              {form.steps.map((step, idx) => (
                <div key={idx} className="step-row">
                  <div className="step-order">Step {step.step_order}</div>
                  <div className="field-group" style={{ flex: 1 }}>
                    <select
                      className="field-input"
                      value={step.approver_user_id}
                      onChange={(e) => updateStep(idx, "approver_user_id", e.target.value)}
                      required
                    >
                      <option value="">Select approver</option>
                      {allUsers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  {["HYBRID"].includes(form.condition_type) && (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={step.is_required !== false}
                        onChange={(e) => updateStep(idx, "is_required", e.target.checked)}
                      />
                      Required
                    </label>
                  )}
                  <button type="button" className="btn btn-sm btn-ghost step-remove" onClick={() => removeStep(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : editing ? "Save Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r, u, c] = await Promise.all([getRules(), getUsers(), getCategories()]);
      setRules(r);
      setAllUsers(u);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this rule?")) return;
    try { await deleteRule(id); load(); } catch (e) { alert(e.message); }
  };

  const handleEdit = (rule) => {
    setEditing({
      ...rule,
      steps: rule.steps || [],
      max_amount: rule.max_amount || "",
      percentage_threshold: rule.percentage_threshold || "",
      specific_approver_id: rule.specific_approver_id || "",
      category_id: rule.category_id || "",
    });
    setShowModal(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Rules</h1>
          <p className="page-subtitle">Define how expenses get approved</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + New Rule
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : rules.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">⚙️</span>
          <p>No rules configured yet</p>
          <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>Create first rule</button>
        </div>
      ) : (
        <div className="rules-grid">
          {rules.map((rule) => (
            <div key={rule.id} className="rule-card">
              <div className="rule-card-header">
                <div>
                  <div className="rule-name">{rule.name}</div>
                  {rule.description && <div className="rule-desc">{rule.description}</div>}
                </div>
                <span className={`condition-badge condition-${rule.condition_type.toLowerCase()}`}>
                  {rule.condition_type}
                </span>
              </div>

              <div className="rule-meta">
                <div className="rule-meta-item">
                  <span className="rule-meta-label">Amount Range</span>
                  <span className="rule-meta-value">
                    {parseFloat(rule.min_amount).toLocaleString()} – {rule.max_amount ? parseFloat(rule.max_amount).toLocaleString() : "∞"}
                  </span>
                </div>
                {rule.category_name && (
                  <div className="rule-meta-item">
                    <span className="rule-meta-label">Category</span>
                    <span className="rule-meta-value">{rule.category_name}</span>
                  </div>
                )}
                {rule.percentage_threshold && (
                  <div className="rule-meta-item">
                    <span className="rule-meta-label">Threshold</span>
                    <span className="rule-meta-value">{rule.percentage_threshold}%</span>
                  </div>
                )}
                {rule.specific_approver_name && (
                  <div className="rule-meta-item">
                    <span className="rule-meta-label">Specific Approver</span>
                    <span className="rule-meta-value">{rule.specific_approver_name}</span>
                  </div>
                )}
              </div>

              {rule.is_manager_first && (
                <div className="rule-manager-badge">👔 Manager approval required first</div>
              )}

              {rule.steps?.length > 0 && (
                <div className="rule-steps">
                  {rule.steps.map((s) => (
                    <div key={s.id} className="rule-step-pill">
                      <span className="step-num">{s.step_order}</span>
                      {s.approver_name}
                    </div>
                  ))}
                </div>
              )}

              <div className="rule-card-footer">
                <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(rule)}>Edit</button>
                <button className="btn btn-sm btn-danger-ghost" onClick={() => handleDelete(rule.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RuleModal
          allUsers={allUsers}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={load}
          editing={editing}
        />
      )}
    </div>
  );
}