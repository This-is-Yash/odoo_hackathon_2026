// import React, { useState } from "react";
// import { loginUser } from "../api";

// export default function Login({ setPage }) {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

// //   const handleLogin = async () => {
// //     const data = await loginUser(form);

// //     if (data.error) {
// //       setError(data.error);
// //     } else {
// //       localStorage.setItem("token", data.token);
// //       setPage("dashboard");
// //     }
// //   };

//     const handleLogin = async () => {
//       try {
//         const data = await loginUser(form);
//         if (data.error) setError(data.error);
//         else {
//           localStorage.setItem("token", data.token);
//           setPage("dashboard");
//         }
//       } catch (err) {
//         setError("Login failed. Please try again.");
//       }
//     };

//   return (
//     <div className="card">
//       <h2 className="title">Login</h2>

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

//       {error && <p className="error">{error}</p>}

//       <button onClick={handleLogin} className="btn">
//         Login
//       </button>

//       <p className="switch" onClick={() => setPage("register")}>
//         Create account
//       </p>
//     </div>
//   );
// }
import React, { useState } from "react";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login({ setPage }) {
  const { login } = useAuth(); // AuthContext login function
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Debug: check what is being sent
      console.log("Login payload:", form);

      // Make API call
      const data = await loginUser(form); // must return { token, user }

      // Debug: check API response
      console.log("Login response:", data);

      if (!data.token) {
        throw new Error("Invalid response from server");
      }

      // Save token & user in AuthContext
      login(data.token, data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💼</div>
          <h1 className="auth-title">ReimburseIQ</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              name="email"
              type="email"
              className="field-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              name="password"
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button className="link-btn" onClick={() => setPage("register")}>
            Register your company
          </button>
        </p>
      </div>
    </div>
  );
}
// import React, { useState } from "react";
// import { loginUser } from "../api";
// import { useAuth } from "../context/AuthContext";

// export default function Login({ setPage }) {
//   const { login } = useAuth(); // AuthContext login function
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Update form state
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Handle form submission
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // Debug: check what is being sent
//       console.log("Login payload:", form);

//       // Make API call
//       const data = await loginUser(form); // must return { token, user }

//       // Debug: check API response
//       console.log("Login response:", data);

//       if (!data.token) {
//         throw new Error("Invalid response from server");
//       }

//       // Save token & user in AuthContext
//       login(data.token, data.user);
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(err.message || "Login failed. Check your credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-header">
//           <div className="auth-logo">💼</div>
//           <h1 className="auth-title">ReimburseIQ</h1>
//           <p className="auth-subtitle">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="auth-form">
//           <div className="field-group">
//             <label className="field-label">Email</label>
//             <input
//               name="email"
//               type="email"
//               className="field-input"
//               placeholder="you@company.com"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="field-group">
//             <label className="field-label">Password</label>
//             <input
//               name="password"
//               type="password"
//               className="field-input"
//               placeholder="••••••••"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {error && <div className="alert alert-error">{error}</div>}

//           <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
//             {loading ? "Loading..." : "Sign In"}
//           </button>
//         </form>

//         <p className="auth-switch">
//           Don't have an account?{" "}
//           <button className="link-btn" onClick={() => setPage("register")}>
//             Register your company
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import { loginUser } from "../api";
// import { useAuth } from "../context/AuthContext";

// export default function Login({ setPage }) {
//   const { login } = useAuth(); // Must provide login(token, user)
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const data = await loginUser(form); // Must return { token, user }

//       // Call AuthContext login
//       login(data.token, data.user); // Saves token and user in context/localStorage
//     } catch (err) {
//       setError(err.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-header">
//           <div className="auth-logo">💼</div>
//           <h1 className="auth-title">ReimburseIQ</h1>
//           <p className="auth-subtitle">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="auth-form">
//           <div className="field-group">
//             <label className="field-label">Email</label>
//             <input
//               name="email"
//               type="email"
//               className="field-input"
//               placeholder="you@company.com"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="field-group">
//             <label className="field-label">Password</label>
//             <input
//               name="password"
//               type="password"
//               className="field-input"
//               placeholder="••••••••"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {error && <div className="alert alert-error">{error}</div>}

//           <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
//             {loading ? <span className="btn-spinner" /> : "Sign In"}
//           </button>
//         </form>

//         <p className="auth-switch">
//           Don't have an account?{" "}
//           <button className="link-btn" onClick={() => setPage("register")}>
//             Register your company
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import { loginUser } from "../api";
// import { useAuth } from "../context/AuthContext";

// export default function Login({ setPage }) {
//   const { login } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       const data = await loginUser(form);
//       login(data.token, data.user);
//     } catch (err) {
//       setError(err.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-header">
//           <div className="auth-logo">💼</div>
//           <h1 className="auth-title">ReimburseIQ</h1>
//           <p className="auth-subtitle">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="auth-form">
//           <div className="field-group">
//             <label className="field-label">Email</label>
//             <input
//               name="email"
//               type="email"
//               className="field-input"
//               placeholder="you@company.com"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="field-group">
//             <label className="field-label">Password</label>
//             <input
//               name="password"
//               type="password"
//               className="field-input"
//               placeholder="••••••••"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {error && <div className="alert alert-error">{error}</div>}

//           <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
//             {loading ? <span className="btn-spinner" /> : "Sign In"}
//           </button>
//         </form>

//         <p className="auth-switch">
//           Don't have an account?{" "}
//           <button className="link-btn" onClick={() => setPage("register")}>
//             Register your company
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }