// import React, { useState } from "react";
// import { registerUser } from "../api";

// export default function Register({ setPage }) {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     name: "",
//     role: "EMPLOYEE",
//   });

//   const [error, setError] = useState("");

//   const handleRegister = async () => {
//     const data = await registerUser(form);

//     if (data.error) {
//       setError(data.error);
//     } else {
//       alert("Registered successfully");
//       setPage("login");
//     }
//   };

//   return (
//     <div className="card">
//       <h2 className="title">Register</h2>

//       <input
//         placeholder="Name"
//         className="input"
//         onChange={(e) => setForm({ ...form, name: e.target.value })}
//       />

//       <input
//         placeholder="Email"
//         className="input"
//         onChange={(e) => setForm({ ...form, email: e.target.value })}
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         className="input"
//         onChange={(e) => setForm({ ...form, password: e.target.value })}
//       />

//       <select
//         className="input"
//         onChange={(e) => setForm({ ...form, role: e.target.value })}
//       >
//         <option value="employee">Employee</option>
//         <option value="manager">Manager</option>
//       </select>

//       {error && <p className="error">{error}</p>}

//       <button onClick={handleRegister} className="btn">
//         Register
//       </button>

//       <p className="switch" onClick={() => setPage("login")}>
//         Already have an account?
//       </p>
//     </div>
//   );
// }
import React, { useState } from "react";
import { registerUser } from "../api";

export default function Register({ setPage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await registerUser(form);

      if (data.error) {
        setError(data.error);
      } else {
        alert("✅ Registered successfully!");
        setPage("login");
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Create Account</h2>

      <input
        name="name"
        placeholder="Full Name"
        className="input"
        onChange={handleChange}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="input"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="input"
        onChange={handleChange}
      />

      <select
        name="role"
        className="input"
        onChange={handleChange}
        value={form.role}
      >
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
      </select>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleRegister}
        className="btn"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="switch" onClick={() => setPage("login")}>
        Already have an account?
      </p>
    </div>
  );
}