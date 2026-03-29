// import React, { useState } from "react";

// export default function App() {
//   const [page, setPage] = useState("login");
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     name: "",
//     role: "EMPLOYEE",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async () => {
//     const res = await fetch("http://localhost:8000/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: form.email,
//         password: form.password,
//       }),
//     });

//     const data = await res.json();
//     alert("Login Success: " + JSON.stringify(data));
//   };

//   const handleRegister = async () => {
//     const res = await fetch("http://localhost:8000/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });

//     const data = await res.json();
//     alert("Registered: " + JSON.stringify(data));
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
//         <h2 className="text-2xl font-bold text-center mb-6">
//           {page === "login" ? "Login" : "Register"}
//         </h2>

//         {page === "register" && (
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             className="w-full mb-3 p-2 border rounded"
//             onChange={handleChange}
//           />
//         )}

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           className="w-full mb-3 p-2 border rounded"
//           onChange={handleChange}
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           className="w-full mb-3 p-2 border rounded"
//           onChange={handleChange}
//         />

//         {page === "register" && (
//           <select
//             name="role"
//             className="w-full mb-3 p-2 border rounded"
//             onChange={handleChange}
//           >
//             <option value="EMPLOYEE">Employee</option>
//             <option value="MANAGER">Manager</option>
//           </select>
//         )}

//         <button
//           onClick={page === "login" ? handleLogin : handleRegister}
//           className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
//         >
//           {page === "login" ? "Login" : "Register"}
//         </button>

//         <p className="text-center mt-4 text-sm">
//           {page === "login" ? "Don't have an account?" : "Already have an account?"}
//         </p>

//         <button
//           onClick={() => setPage(page === "login" ? "register" : "login")}
//           className="w-full mt-2 text-indigo-600 underline"
//         >
//           Switch to {page === "login" ? "Register" : "Login"}
//         </button>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";

export default function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  return (
    <div className="container">
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </div>
  );
}