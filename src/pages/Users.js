import React, { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, getManagers } from "../api";

function UserModal({ managers, onClose, onSaved, editing }) {
  const [form, setForm] = useState(
    editing || { name: "", email: "", password: "", role: "employee", manager_id: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editing) {
        await updateUser(editing.id, {
          role: form.role,
          manager_id: form.manager_id || null,
          is_active: form.is_active,
        });
      } else {
        await createUser({ ...form, manager_id: form.manager_id || null });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit User" : "Add User"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {!editing && (
            <>
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input name="name" className="field-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input name="email" type="email" className="field-input" placeholder="john@company.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input name="password" type="password" className="field-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Role</label>
              <select name="role" className="field-input" value={form.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Reports To (Manager)</label>
              <select name="manager_id" className="field-input" value={form.manager_id || ""} onChange={handleChange}>
                <option value="">No manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          {editing && (
            <div className="field-group">
              <label className="field-label">Status</label>
              <select
                name="is_active"
                className="field-input"
                value={form.is_active ? "true" : "false"}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : editing ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([getUsers(), getManagers()]);
      setUsers(u);
      setManagers(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (user) => {
    setEditing({ ...user, manager_id: user.manager_id || "" });
    setShowModal(true);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCount = (r) => users.filter((u) => u.role === r).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + Add User
        </button>
      </div>

      <div className="toolbar">
        <input
          className="field-input search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {[["all", "All", users.length], ["employee", "Employees", roleCount("employee")], ["manager", "Managers", roleCount("manager")]].map(([val, label, count]) => (
            <button
              key={val}
              className={`filter-tab ${roleFilter === val ? "active" : ""}`}
              onClick={() => setRoleFilter(val)}
            >
              {label} <span className="filter-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>No users found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={!u.is_active ? "row-inactive" : ""}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">{u.name[0]?.toUpperCase()}</div>
                      {u.name}
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td>{u.manager_name || <span className="text-muted">—</span>}</td>
                  <td>
                    <span className={`status-badge ${u.is_active ? "status-green" : "status-gray"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(u)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          managers={managers.filter((m) => !editing || m.id !== editing.id)}
          onClose={() => setShowModal(false)}
          onSaved={load}
          editing={editing}
        />
      )}
    </div>
  );
}