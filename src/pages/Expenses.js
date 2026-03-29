import React, { useEffect, useState, useRef } from "react";
import {
  getExpenses, createExpense, submitExpense, cancelExpense,
  getCategories, scanReceipt, confirmOcr, getExpense
} from "../api";
import { useAuth } from "../context/AuthContext";

const statusColor = { PENDING: "orange", APPROVED: "green", REJECTED: "red", DRAFT: "gray", CANCELLED: "gray" };

// ─── OCR Upload Modal ─────────────────────────────────────────────────────────
function OcrModal({ onClose, onFill }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const data = await scanReceipt(fd);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleUse = () => {
    if (result) onFill(result.extracted, result.ocr_id, result.image_url);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📸 Scan Receipt with OCR</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!preview ? (
            <div
              className="ocr-dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current.click()}
            >
              <div className="ocr-drop-icon">📷</div>
              <p className="ocr-drop-text">Drop a receipt image here or click to upload</p>
              <p className="ocr-drop-sub">Supports JPG, PNG, WEBP — up to 10MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="ocr-preview-grid">
              <div className="ocr-image-wrap">
                <img src={preview} alt="receipt" className="ocr-preview-img" />
                <button className="link-btn mt-8" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                  Change image
                </button>
              </div>

              {result ? (
                <div className="ocr-results">
                  <div className="ocr-confidence">
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${result.extracted.confidence_score}%` }} />
                    </div>
                    <span>Confidence: {result.extracted.confidence_score}%</span>
                  </div>
                  <div className="ocr-fields">
                    {[
                      { label: "Amount", value: result.extracted.extracted_amount },
                      { label: "Currency", value: result.extracted.extracted_currency },
                      { label: "Date", value: result.extracted.extracted_date },
                      { label: "Vendor", value: result.extracted.extracted_vendor },
                      { label: "Category", value: result.extracted.extracted_category },
                      { label: "Description", value: result.extracted.extracted_description },
                    ].map(({ label, value }) => (
                      <div key={label} className="ocr-field-row">
                        <span className="ocr-field-label">{label}</span>
                        <span className={`ocr-field-value ${!value ? "ocr-field-empty" : ""}`}>
                          {value || "Not detected"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleUse}>
                    Use These Values →
                  </button>
                </div>
              ) : (
                <div className="ocr-scan-action">
                  {error && <div className="alert alert-error">{error}</div>}
                  <button className="btn btn-primary btn-full" onClick={handleScan} disabled={scanning}>
                    {scanning ? (
                      <><span className="btn-spinner" /> Scanning...</>
                    ) : "🔍 Scan Receipt"}
                  </button>
                  <p className="ocr-scan-note">OCR will extract amount, date, vendor and more</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expense Form Modal ───────────────────────────────────────────────────────
function ExpenseForm({ categories, onClose, onSaved, prefill, ocrId, ocrImageUrl }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category_id: "", description: "", expense_date: new Date().toISOString().slice(0, 10),
    amount: "", currency: user?.company_currency || "USD",
    ...prefill,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Map OCR category name to category id
  useEffect(() => {
    if (prefill?.extracted_category && categories.length) {
      const match = categories.find((c) =>
        c.name.toLowerCase().includes(prefill.extracted_category.toLowerCase())
      );
      if (match) setForm((f) => ({ ...f, category_id: match.id }));
    }
  }, [prefill, categories]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append("receipt", file);
      else if (ocrImageUrl) fd.append("receipt_url", ocrImageUrl);

      const saved = await createExpense(fd);

      // Link OCR if available
      if (ocrId) {
        try { await confirmOcr(ocrId, saved.id); } catch {}
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SGD", "AUD", "CAD", "JPY", "CNY"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Expense Claim</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field-group">
            <label className="field-label">Category</label>
            <select name="category_id" className="field-input" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea
              name="description"
              className="field-input field-textarea"
              placeholder="What was this expense for?"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Date</label>
              <input
                name="expense_date"
                type="date"
                className="field-input"
                value={form.expense_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Currency</label>
              <select name="currency" className="field-input" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Amount ({form.currency})</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="field-input"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Receipt {ocrImageUrl ? "(from OCR scan)" : "(optional)"}</label>
            {ocrImageUrl && !file ? (
              <div className="ocr-receipt-preview">
                <img src={`http://localhost:8000${ocrImageUrl}`} alt="scanned" className="receipt-thumb" />
                <span className="link-btn" onClick={() => document.getElementById("receipt-file").click()}>
                  Replace
                </span>
              </div>
            ) : null}
            <input
              id="receipt-file"
              type="file"
              accept="image/*,application/pdf"
              className="field-input"
              style={ocrImageUrl && !file ? { display: "none" } : {}}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Expense Detail Modal ─────────────────────────────────────────────────────
function ExpenseDetail({ expenseId, onClose, onRefresh, userRole }) {
  const [exp, setExp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getExpense(expenseId).then(setExp).catch(() => setError("Failed to load"));
  }, [expenseId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitExpense(expenseId);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this expense?")) return;
    setCancelling(true);
    try {
      await cancelExpense(expenseId);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (!exp && !error) return (
    <div className="modal-overlay">
      <div className="modal"><div className="page-loading"><div className="spinner" /></div></div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Expense Details</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`status-badge status-${statusColor[exp?.status]}`}>{exp?.status}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {exp && (
            <>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Description</span><span className="detail-value">{exp.description}</span></div>
                <div className="detail-item"><span className="detail-label">Category</span><span className="detail-value">{exp.category_name}</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{exp.expense_date?.slice(0, 10)}</span></div>
                <div className="detail-item">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value amount-highlight">{exp.currency} {parseFloat(exp.amount).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company Amount</span>
                  <span className="detail-value">{exp.company_currency} {parseFloat(exp.amount_company_currency).toLocaleString()}</span>
                </div>
                {exp.rule_name && <div className="detail-item"><span className="detail-label">Approval Rule</span><span className="detail-value">{exp.rule_name}</span></div>}
              </div>

              {exp.receipt_url && (
                <div className="field-group">
                  <span className="detail-label">Receipt</span>
                  <a href={`http://localhost:8000${exp.receipt_url}`} target="_blank" rel="noreferrer" className="receipt-link">
                    📎 View Receipt
                  </a>
                </div>
              )}

              {exp.approval_steps?.length > 0 && (
                <div className="approval-timeline">
                  <h3 className="timeline-title">Approval Progress</h3>
                  <div className="timeline">
                    {exp.approval_steps.map((s) => (
                      <div key={s.id} className={`timeline-step step-${s.status?.toLowerCase()}`}>
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-approver">
                            {s.is_manager_step ? "👔 " : ""}{s.approver_name}
                            <span className="timeline-role">{s.approver_role}</span>
                          </div>
                          {s.comment && <div className="timeline-comment">"{s.comment}"</div>}
                          <div className="timeline-status">
                            <span className={`status-badge status-${statusColor[s.status]}`}>{s.status}</span>
                            {s.decided_at && <span className="timeline-date">{new Date(s.decided_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                {exp.status === "DRAFT" && (
                  <>
                    <button className="btn btn-ghost" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? <span className="btn-spinner" /> : "Cancel Expense"}
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <span className="btn-spinner" /> : "Submit for Approval →"}
                    </button>
                  </>
                )}
                {exp.status === "PENDING" && (
                  <button className="btn btn-ghost" onClick={handleCancel} disabled={cancelling}>
                    Withdraw
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Expenses Page ───────────────────────────────────────────────────────
export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [ocrPrefill, setOcrPrefill] = useState(null);
  const [ocrId, setOcrId] = useState(null);
  const [ocrImageUrl, setOcrImageUrl] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [exp, cats] = await Promise.all([getExpenses(), getCategories()]);
      setExpenses(exp);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOcrFill = (extracted, ocr_id, imageUrl) => {
    setOcrPrefill({
      amount: extracted.extracted_amount || "",
      currency: extracted.extracted_currency || user?.company_currency || "USD",
      expense_date: extracted.extracted_date || new Date().toISOString().slice(0, 10),
      description: extracted.extracted_description || "",
      extracted_category: extracted.extracted_category || "",
    });
    setOcrId(ocr_id);
    setOcrImageUrl(imageUrl);
    setShowOcr(false);
    setShowForm(true);
  };

  const filtered = filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter);

  const FILTERS = ["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{expenses.length} total records</p>
        </div>
        {user?.role === "employee" && (
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={() => setShowOcr(true)}>📸 Scan Receipt</button>
            <button className="btn btn-primary" onClick={() => { setOcrPrefill(null); setOcrId(null); setOcrImageUrl(null); setShowForm(true); }}>
              + New Expense
            </button>
          </div>
        )}
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="filter-count">
              {f === "ALL" ? expenses.length : expenses.filter((e) => e.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No {filter !== "ALL" ? filter.toLowerCase() : ""} expenses found</p>
          {user?.role === "employee" && filter === "ALL" && (
            <button className="btn btn-primary mt-16" onClick={() => setShowForm(true)}>Create your first expense</button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                {user?.role !== "employee" && <th>Employee</th>}
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td><div className="td-main">{e.description}</div></td>
                  <td><span className="category-pill">{e.category_name}</span></td>
                  <td>{e.expense_date?.slice(0, 10)}</td>
                  <td>
                    <div className="amount-cell">
                      <span>{e.currency} {parseFloat(e.amount).toLocaleString()}</span>
                      {e.currency !== e.company_currency && (
                        <span className="amount-converted">≈ {e.company_currency} {parseFloat(e.amount_company_currency).toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  {user?.role !== "employee" && <td>{e.employee_name}</td>}
                  <td><span className={`status-badge status-${statusColor[e.status]}`}>{e.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setSelectedId(e.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showOcr && <OcrModal onClose={() => setShowOcr(false)} onFill={handleOcrFill} />}
      {showForm && (
        <ExpenseForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => load()}
          prefill={ocrPrefill}
          ocrId={ocrId}
          ocrImageUrl={ocrImageUrl}
        />
      )}
      {selectedId && (
        <ExpenseDetail
          expenseId={selectedId}
          onClose={() => setSelectedId(null)}
          onRefresh={load}
          userRole={user?.role}
        />
      )}
    </div>
  );
}