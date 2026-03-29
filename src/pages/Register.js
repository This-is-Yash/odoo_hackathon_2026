// // import React, { useState } from "react";
// // import { registerUser } from "../api";

// // export default function Register({ setPage }) {
// //   const [form, setForm] = useState({
// //     email: "",
// //     password: "",
// //     name: "",
// //     role: "EMPLOYEE",
// //   });

// //   const [error, setError] = useState("");

// //   const handleRegister = async () => {
// //     const data = await registerUser(form);

// //     if (data.error) {
// //       setError(data.error);
// //     } else {
// //       alert("Registered successfully");
// //       setPage("login");
// //     }
// //   };

// //   return (
// //     <div className="card">
// //       <h2 className="title">Register</h2>

// //       <input
// //         placeholder="Name"
// //         className="input"
// //         onChange={(e) => setForm({ ...form, name: e.target.value })}
// //       />

// //       <input
// //         placeholder="Email"
// //         className="input"
// //         onChange={(e) => setForm({ ...form, email: e.target.value })}
// //       />

// //       <input
// //         type="password"
// //         placeholder="Password"
// //         className="input"
// //         onChange={(e) => setForm({ ...form, password: e.target.value })}
// //       />

// //       <select
// //         className="input"
// //         onChange={(e) => setForm({ ...form, role: e.target.value })}
// //       >
// //         <option value="employee">Employee</option>
// //         <option value="manager">Manager</option>
// //       </select>

// //       {error && <p className="error">{error}</p>}

// //       <button onClick={handleRegister} className="btn">
// //         Register
// //       </button>

// //       <p className="switch" onClick={() => setPage("login")}>
// //         Already have an account?
// //       </p>
// //     </div>
// //   );
// // }
// import React, { useState } from "react";
// import { registerUser } from "../api";

// export default function Register({ setPage }) {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "employee",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleRegister = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const data = await registerUser(form);

//       if (data.error) {
//         setError(data.error);
//       } else {
//         alert("✅ Registered successfully!");
//         setPage("login");
//       }
//     } catch (err) {
//       setError("Something went wrong");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="card">
//       <h2 className="title">Create Account</h2>

//       <input
//         name="name"
//         placeholder="Full Name"
//         className="input"
//         onChange={handleChange}
//       />

//       <input
//         name="email"
//         type="email"
//         placeholder="Email"
//         className="input"
//         onChange={handleChange}
//       />

//       <input
//         name="password"
//         type="password"
//         placeholder="Password"
//         className="input"
//         onChange={handleChange}
//       />

//       <select
//         name="role"
//         className="input"
//         onChange={handleChange}
//         value={form.role}
//       >
//         <option value="employee">Employee</option>
//         <option value="manager">Manager</option>
//       </select>

//       {error && <p className="error">{error}</p>}

//       <button
//         onClick={handleRegister}
//         className="btn"
//         disabled={loading}
//       >
//         {loading ? "Registering..." : "Register"}
//       </button>

//       <p className="switch" onClick={() => setPage("login")}>
//         Already have an account?
//       </p>
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { registerUser, getCountries } from "../api";
// import { useAuth } from "../context/AuthContext";

// export default function Register({ setPage }) {
//   const { login } = useAuth();
//   const [countries, setCountries] = useState([]);
//   const [form, setForm] = useState({
//     companyName: "", name: "", email: "",
//     password: "", countryCode: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [loadingCountries, setLoadingCountries] = useState(true);

//             // useEffect(() => {
//             //     getCountries()
//             //     .then(setCountries)
//             //     .catch(() => setCountries([]))
//             //     .finally(() => setLoadingCountries(false));
//             // }, []);

// //         useEffect(() => {
// //   // Temporary hardcoded countries for testing
// //         // const dummyCountries = [
// //         //     { code: "US", name: "United States", currency: "USD", currencyName: "Dollar" },
// //         //     { code: "IN", name: "India", currency: "INR", currencyName: "Rupee" },
// //         //     { code: "GB", name: "United Kingdom", currency: "GBP", currencyName: "Pound" },
// //         //     { code: "JP", name: "Japan", currency: "JPY", currencyName: "Yen" },
// //         //     { code: "CA", name: "Canada", currency: "CAD", currencyName: "Dollar" },
// //         // ];

// //         // setCountries(dummyCountries);
// //         // setLoadingCountries(false); // Done loading
// //         // }, []);

//             useEffect(() => {
//             console.log("Fetching countries...");
//             getCountries()
//                 .then((res) => {
//                 console.log("Countries response:", res);
//                 setCountries(res); // or res.data if API wraps it
//                 })
//                 .catch((err) => {
//                 console.error("Error fetching countries:", err);
//                 setCountries([]);
//                 })
//                 .finally(() => setLoadingCountries(false));
//             }, []);
//   const selectedCountry = countries.find((c) => c.code === form.countryCode);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!form.countryCode) return setError("Please select a country");
//     setLoading(true);
//     setError("");
//     try {
//       const data = await registerUser(form);
//       login(data.token, data.user);
//     } catch (err) {
//       setError(err.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card auth-card-wide">
//         <div className="auth-header">
//           <div className="auth-logo">💼</div>
//           <h1 className="auth-title">ReimburseIQ</h1>
//           <p className="auth-subtitle">Create your company account</p>
//         </div>

//         <form onSubmit={handleRegister} className="auth-form">
//           <div className="form-row">
//             <div className="field-group">
//               <label className="field-label">Company Name</label>
//               <input
//                 name="companyName"
//                 className="field-input"
//                 placeholder="Acme Corp"
//                 value={form.companyName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="field-group">
//               <label className="field-label">Country</label>
//               <select
//                 name="countryCode"
//                 className="field-input"
//                 value={form.countryCode}
//                 onChange={handleChange}
//                 required
//                 disabled={loadingCountries}
//               >
//                 <option value="">{loadingCountries ? "Loading..." : "Select country"}</option>
//                 {countries.map((c) => (
//                   <option key={c.code} value={c.code}>
//                     {c.name} ({c.currency})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {selectedCountry && (
//             <div className="currency-badge">
//               🌍 Company currency will be set to <strong>{selectedCountry.currency}</strong> ({selectedCountry.currencyName})
//             </div>
//           )}

//           <div className="form-divider">Admin Account</div>

//           <div className="form-row">
//             <div className="field-group">
//               <label className="field-label">Your Name</label>
//               <input
//                 name="name"
//                 className="field-input"
//                 placeholder="John Doe"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="field-group">
//               <label className="field-label">Email</label>
//               <input
//                 name="email"
//                 type="email"
//                 className="field-input"
//                 placeholder="admin@company.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           <div className="field-group">
//             <label className="field-label">Password</label>
//             <input
//               name="password"
//               type="password"
//               className="field-input"
//               placeholder="Min. 6 characters"
//               value={form.password}
//               onChange={handleChange}
//               required
//               minLength={6}
//             />
//           </div>

//           {error && <div className="alert alert-error">{error}</div>}

//           <button type="submit" className="btn btn-primary btn-full" disabled={loading || loadingCountries}>
//             {loading ? <span className="btn-spinner" /> : "Create Company & Account"}
//           </button>
//         </form>

//         <p className="auth-switch">
//           Already have an account?{" "}
//           <button className="link-btn" onClick={() => setPage("login")}>Sign in</button>
//         </p>
//       </div>
//     </div>
//   );
// }
// src/components/Register.js
// src/api.js
import React, { useState, useEffect } from "react";
import { registerUser, getCountries } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register({ setPage }) {
  const { login } = useAuth();
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({
    companyName: "", name: "", email: "",
    password: "", countryCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);

//   useEffect(() => {
//     getCountries()
//       .then(setCountries)
//       .catch(() => setCountries([]))
//       .finally(() => setLoadingCountries(false));
//   }, []);
    // import { getCountries } from "../api";

        // useEffect(() => {
        // console.log("Fetching countries...");
        // getCountries()
        //     .then((res) => {
        //     console.log("Countries response:", res);
        //     setCountries(res);
        //     })
        //     .catch((err) => {
        //     console.error("Error fetching countries:", err);
        //     setCountries([]);
        //     })
        //     .finally(() => setLoadingCountries(false));
        // }, []);
        useEffect(() => {
//   Temporary hardcoded countries for testing
        const dummyCountries = [
            { code: "US", name: "United States", currency: "USD", currencyName: "Dollar" },
            { code: "IN", name: "India", currency: "INR", currencyName: "Rupee" },
            { code: "GB", name: "United Kingdom", currency: "GBP", currencyName: "Pound" },
            { code: "JP", name: "Japan", currency: "JPY", currencyName: "Yen" },
            { code: "CA", name: "Canada", currency: "CAD", currencyName: "Dollar" },
        ];

        setCountries(dummyCountries);
        setLoadingCountries(false); // Done loading
        }, []);

  const selectedCountry = countries.find((c) => c.code === form.countryCode);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.countryCode) return setError("Please select a country");
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">💼</div>
          <h1 className="auth-title">ReimburseIQ</h1>
          <p className="auth-subtitle">Create your company account</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Company Name</label>
              <input
                name="companyName"
                className="field-input"
                placeholder="Acme Corp"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Country</label>
              <select
                name="countryCode"
                className="field-input"
                value={form.countryCode}
                onChange={handleChange}
                required
                disabled={loadingCountries}
              >
                <option value="">{loadingCountries ? "Loading..." : "Select country"}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCountry && (
            <div className="currency-badge">
              🌍 Company currency will be set to <strong>{selectedCountry.currency}</strong> ({selectedCountry.currencyName})
            </div>
          )}

          <div className="form-divider">Admin Account</div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Your Name</label>
              <input
                name="name"
                className="field-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                name="email"
                type="email"
                className="field-input"
                placeholder="admin@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              name="password"
              type="password"
              className="field-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || loadingCountries}>
            {loading ? <span className="btn-spinner" /> : "Create Company & Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button className="link-btn" onClick={() => setPage("login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
}