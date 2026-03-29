// import React from "react";

// export default function Dashboard({ setPage }) {
//   const logout = () => {
//     localStorage.removeItem("token");
//     setPage("login");
//   };

//   return (
//     <div className="card">
//       <h2 className="title">Dashboard</h2>
//       <p>Welcome! You are logged in 🚀</p>

//       <button className="btn" onClick={logout}>
//         Logout
//       </button>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { getExpenseSummary, getExpenses, getApprovalQueue } from "../api";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const statusColor = { PENDING: "orange", APPROVED: "green", REJECTED: "red", DRAFT: "gray", CANCELLED: "gray" };

export default function Dashboard({ setPage }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, exp] = await Promise.all([getExpenseSummary(), getExpenses()]);
        setSummary(sum);
        setRecent(exp.slice(0, 5));
        if (user?.role !== "employee") {
          const q = await getApprovalQueue();
          setQueue(q.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const currency = user?.company_currency || "";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">{user?.company_name} · {currency}</p>
        </div>
        {user?.role === "employee" && (
          <button className="btn btn-primary" onClick={() => setPage("expenses")}>
            + New Expense
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard label="Pending" value={summary?.pending || 0} icon="⏳" color="orange" />
        <StatCard label="Approved" value={summary?.approved || 0} icon="✅" color="green" />
        <StatCard label="Rejected" value={summary?.rejected || 0} icon="❌" color="red" />
        <StatCard label="Drafts" value={summary?.draft || 0} icon="📝" color="blue" />
        {user?.role !== "employee" && (
          <StatCard
            label="Total Approved"
            value={`${currency} ${parseFloat(summary?.total_approved_amount || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`}
            icon="💰"
            color="purple"
          />
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Recent Expenses</h2>
            <button className="link-btn" onClick={() => setPage("expenses")}>View all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No expenses yet</p>
            </div>
          ) : (
            <div className="expense-list">
              {recent.map((e) => (
                <div key={e.id} className="expense-row">
                  <div className="expense-row-left">
                    <span className="expense-category-dot" />
                    <div>
                      <div className="expense-desc">{e.description}</div>
                      <div className="expense-meta">{e.category_name} · {e.expense_date?.slice(0, 10)}</div>
                    </div>
                  </div>
                  <div className="expense-row-right">
                    <div className="expense-amount">{e.currency} {parseFloat(e.amount).toLocaleString()}</div>
                    <span className={`status-badge status-${statusColor[e.status]}`}>{e.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role !== "employee" && (
          <div className="dash-section">
            <div className="section-header">
              <h2 className="section-title">Pending Approvals</h2>
              <button className="link-btn" onClick={() => setPage("approvals")}>View all →</button>
            </div>
            {queue.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎉</span>
                <p>All caught up!</p>
              </div>
            ) : (
              <div className="expense-list">
                {queue.map((q) => (
                  <div key={q.step_id} className="expense-row">
                    <div className="expense-row-left">
                      <span className="expense-category-dot dot-orange" />
                      <div>
                        <div className="expense-desc">{q.description}</div>
                        <div className="expense-meta">{q.employee_name} · {q.category_name}</div>
                      </div>
                    </div>
                    <div className="expense-row-right">
                      <div className="expense-amount">{q.company_currency} {parseFloat(q.amount_company_currency).toLocaleString()}</div>
                      <button className="btn btn-sm btn-primary" onClick={() => setPage("approvals")}>Review</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}