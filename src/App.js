// // import React, { useState } from "react";

// // export default function App() {
// //   const [page, setPage] = useState("login");
// //   const [form, setForm] = useState({
// //     email: "",
// //     password: "",
// //     name: "",
// //     role: "EMPLOYEE",
// //   });

// //   const handleChange = (e) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleLogin = async () => {
// //     const res = await fetch("http://localhost:8000/login", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         email: form.email,
// //         password: form.password,
// //       }),
// //     });

// //     const data = await res.json();
// //     alert("Login Success: " + JSON.stringify(data));
// //   };

// //   const handleRegister = async () => {
// //     const res = await fetch("http://localhost:8000/register", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(form),
// //     });

// //     const data = await res.json();
// //     alert("Registered: " + JSON.stringify(data));
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
// //       <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
// //         <h2 className="text-2xl font-bold text-center mb-6">
// //           {page === "login" ? "Login" : "Register"}
// //         </h2>

// //         {page === "register" && (
// //           <input
// //             type="text"
// //             name="name"
// //             placeholder="Full Name"
// //             className="w-full mb-3 p-2 border rounded"
// //             onChange={handleChange}
// //           />
// //         )}

// //         <input
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           className="w-full mb-3 p-2 border rounded"
// //           onChange={handleChange}
// //         />

// //         <input
// //           type="password"
// //           name="password"
// //           placeholder="Password"
// //           className="w-full mb-3 p-2 border rounded"
// //           onChange={handleChange}
// //         />

// //         {page === "register" && (
// //           <select
// //             name="role"
// //             className="w-full mb-3 p-2 border rounded"
// //             onChange={handleChange}
// //           >
// //             <option value="EMPLOYEE">Employee</option>
// //             <option value="MANAGER">Manager</option>
// //           </select>
// //         )}

// //         <button
// //           onClick={page === "login" ? handleLogin : handleRegister}
// //           className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
// //         >
// //           {page === "login" ? "Login" : "Register"}
// //         </button>

// //         <p className="text-center mt-4 text-sm">
// //           {page === "login" ? "Don't have an account?" : "Already have an account?"}
// //         </p>

// //         <button
// //           onClick={() => setPage(page === "login" ? "register" : "login")}
// //           className="w-full mt-2 text-indigo-600 underline"
// //         >
// //           Switch to {page === "login" ? "Register" : "Login"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState } from "react";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import "./index.css";

// export default function App() {
//   const [page, setPage] = useState(
//     localStorage.getItem("token") ? "dashboard" : "login"
//   );

//   return (
//     <div className="container">
//       {page === "login" && <Login setPage={setPage} />}
//       {page === "register" && <Register setPage={setPage} />}
//       {page === "dashboard" && <Dashboard setPage={setPage} />}
//     </div>
//   );
// }
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
// import countriesRouter from "./routes/countries.js";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import ApprovalQueue from "./pages/ApprovalQueue";
import Users from "./pages/Users";
import Rules from "./pages/Rules";
import Navbar from "./components/Navbar";
// import countriesRouter from "./routes/countries.js";
import "./App.css";
// import express from "express";

// const app = express();
// app.use(express.json());

// // Mount countries router
// app.use("/api/auth/countries", countriesRouter);

// app.listen(8000, () => console.log("Server running on http://localhost:8000"));
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = React.useState("login");

  React.useEffect(() => {
    if (user) setPage("dashboard");
  }, [user]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  if (!user) {
    return page === "register"
      ? <Register setPage={setPage} />
      : <Login setPage={setPage} />;
  }

  const renderPage = () => {
    switch (page) {
      case "expenses":     return <Expenses />;
      case "approvals":    return <ApprovalQueue />;
      case "users":        return <Users />;
      case "rules":        return <Rules />;
      default:             return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}