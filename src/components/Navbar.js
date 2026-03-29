import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard", roles: ["admin", "manager", "employee"] },
    { key: "expenses",  label: "My Expenses", roles: ["admin", "manager", "employee"] },
    { key: "approvals", label: "Approvals", roles: ["admin", "manager"] },
    { key: "users",     label: "Users", roles: ["admin"] },
    { key: "rules",     label: "Rules", roles: ["admin"] },
  ];

  const visible = navItems.filter((n) => n.roles.includes(user?.role));

  const handleNav = (key) => {
    setPage(key);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => handleNav("dashboard")}>
        <span className="brand-icon">💼</span>
        <span className="brand-name">ReimburseIQ</span>
      </div>

      <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {visible.map((n) => (
          <button
            key={n.key}
            className={`nav-link ${page === n.key ? "active" : ""}`}
            onClick={() => handleNav(n.key)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="navbar-user">
        <div className="user-chip">
          <span className="user-avatar">{user?.name?.[0]?.toUpperCase()}</span>
          <span className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </header>
  );
}