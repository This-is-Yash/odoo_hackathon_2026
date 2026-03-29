import React from "react";

export default function Dashboard({ setPage }) {
  const logout = () => {
    localStorage.removeItem("token");
    setPage("login");
  };

  return (
    <div className="card">
      <h2 className="title">Dashboard</h2>
      <p>Welcome! You are logged in 🚀</p>

      <button className="btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}