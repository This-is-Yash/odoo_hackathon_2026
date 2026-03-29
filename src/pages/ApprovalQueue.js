import React, { useEffect, useState } from "react";
import { getApprovalQueue, getAllPending, decideExpense, getExpense, getApprovalHistory } from "../api";
import { useAuth } from "../context/AuthContext";

const statusColor = { PENDING: "orange", APPROVED: "green", REJECTED: "red", SKIPPED: "gray" };

function DecideModal({ item, onClose, onDone }) {
  const [action, setAction] = useState("approve");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getExpense(item.expense_id).then(setDetail).catch(() => {});
  }, [item.expense_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (action === "reject" && !comment.trim()) {
      return setError("Please provide a reason for rejection");
    }
    setLoading(true);
    setError("");
    try {
      await decideExpense(item.expense_id, { action, comment });
      onDone();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Review Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Employee</span>
              <span className="detail-value">{item.employee_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{item.category_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">{item.expense_date?.slice(0, 10)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount (Company Currency)</span>
              <span className="detail-value amount-highlight">
                {item.company_currency} {parseFloat(item.amount_company_currency).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Original Amount</span>
              <span className="detail-value">{item.currency} {parseFloat(item.amount).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{item.description}</span>
            </div>
            {item.rule_name && (
              <div className="detail-item">
                <span className="detail-label">Rule</span>
                <span className="detail-value">{item.rule_name} ({item.condition_type})</span>
              </div>
            )}
          </div>

          {item.receipt_url && (
            <div className="field-group">
              <a href={`http://localhost:8000${item.receipt_url}`} target="_blank" rel="noreferrer" className="receipt-link">
                📎 View Receipt
              </a>
            </div>
          )}

          {detail?.approval_steps?.length > 0 && (
            <div className="approval-timeline">
              <h3 className="timeline-title">Approval Chain</h3>
              <div className="timeline">
                {detail.approval_steps.map((s) => (
                  <div key={s.id} className={`timeline-step step-${s.status?.toLowerCase()}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-approver">
                        {s.is_manager_step ? "👔 " : `Step ${s.step_order}: `}{s.approver_name}
                      </div>
                      {s.comment && <div className="timeline-comment">"{s.comment}"</div>}
                      <span className={`status-badge status-${statusColor[s.status]}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="decide-actions">
              <button
                type="button"
                className={`decide-btn ${action === "approve" ? "decide-approve-active" : "decide-inactive"}`}
                onClick={() => setAction("approve")}
              >
                ✅ Approve
              </button>
              <button
                type="button"
                className={`decide-btn ${action === "reject" ? "decide-reject-active" : "decide-inactive"}`}
                onClick={() => setAction("reject")}
              >
                ❌ Reject
              </button>
            </div>

            <div className="field-group mt-16">
              <label className="field-label">
                Comment {action === "reject" ? "(required)" : "(optional)"}
              </label>
              <textarea
                className="field-input field-textarea"
                placeholder={action === "reject" ? "Reason for rejection..." : "Add a note (optional)"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required={action === "reject"}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button
                type="submit"
                className={`btn ${action === "approve" ? "btn-success" : "btn-danger"}`}
                disabled={loading}
              >
                {loading ? <span className="btn-spinner" /> : `Confirm ${action === "approve" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [allPending, setAllPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("queue");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [q, h] = await Promise.all([getApprovalQueue(), getApprovalHistory()]);
      setQueue(q);
      setHistory(h);
      if (user?.role === "admin") {
        const all = await getAllPending();
        setAllPending(all);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">
            {queue.length} waiting for your review
          </p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
          My Queue <span className="filter-count">{queue.length}</span>
        </button>
        <button className={`filter-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          History <span className="filter-count">{history.length}</span>
        </button>
        {user?.role === "admin" && (
          <button className={`filter-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
            All Pending <span className="filter-count">{allPending.length}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <>
          {tab === "queue" && (
            queue.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎉</span>
                <p>All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Step</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item) => (
                      <tr key={item.step_id}>
                        <td>{item.employee_name}</td>
                        <td><div className="td-main">{item.description}</div></td>
                        <td><span className="category-pill">{item.category_name}</span></td>
                        <td>{item.expense_date?.slice(0, 10)}</td>
                        <td>
                          <div className="amount-cell">
                            <span className="amount-highlight">{item.company_currency} {parseFloat(item.amount_company_currency).toLocaleString()}</span>
                            <span className="amount-converted">{item.currency} {parseFloat(item.amount).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <span className="step-pill">
                            {item.is_manager_step ? "👔 Manager" : `Step ${item.step_order}`}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => setSelected(item)}>
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === "history" && (
            history.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">📋</span><p>No decisions yet</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Your Decision</th>
                      <th>Comment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.employee_name}</td>
                        <td><div className="td-main">{h.description}</div></td>
                        <td><span className="category-pill">{h.category_name}</span></td>
                        <td>{h.company_currency} {parseFloat(h.amount_company_currency).toLocaleString()}</td>
                        <td><span className={`status-badge status-${statusColor[h.status]}`}>{h.status}</span></td>
                        <td><span className="comment-cell">{h.comment || "—"}</span></td>
                        <td>{h.decided_at ? new Date(h.decided_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === "all" && (
            allPending.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🎉</span><p>No pending expenses company-wide</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Submitted</th>
                      <th>Approval Chain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPending.map((e) => (
                      <tr key={e.id}>
                        <td>{e.employee_name}</td>
                        <td><div className="td-main">{e.description}</div></td>
                        <td><span className="category-pill">{e.category_name}</span></td>
                        <td>{e.company_currency} {parseFloat(e.amount_company_currency).toLocaleString()}</td>
                        <td>{e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : "—"}</td>
                        <td>
                          <div className="chain-pills">
                            {e.steps?.map((s, i) => (
                              <span key={i} className={`chain-pill chain-${s.status?.toLowerCase()}`}>
                                {s.approver_name?.split(" ")[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {selected && (
        <DecideModal
          item={selected}
          onClose={() => setSelected(null)}
          onDone={load}
        />
      )}
    </div>
  );
}