import React, { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setPage }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

//   const handleLogin = async () => {
//     const data = await loginUser(form);

//     if (data.error) {
//       setError(data.error);
//     } else {
//       localStorage.setItem("token", data.token);
//       setPage("dashboard");
//     }
//   };

    const handleLogin = async () => {
      try {
        const data = await loginUser(form);
        if (data.error) setError(data.error);
        else {
          localStorage.setItem("token", data.token);
          setPage("dashboard");
        }
      } catch (err) {
        setError("Login failed. Please try again.");
      }
    };

  return (
    <div className="card">
      <h2 className="title">Login</h2>

      <input
        placeholder="Email"
        className="input"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        className="input"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleLogin} className="btn">
        Login
      </button>

      <p className="switch" onClick={() => setPage("register")}>
        Create account
      </p>
    </div>
  );
}