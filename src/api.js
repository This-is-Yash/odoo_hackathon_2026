// // const BASE_URL = "http://localhost:8000";

// // export const registerUser = async (data) => {
// //   const res = await fetch(`${BASE_URL}/register`, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify(data),
// //   });

// //   return res.json();
// // };

// // export const loginUser = async (data) => {
// //   const res = await fetch(`${BASE_URL}/login`, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify(data),
// //   });

// //   return res.json();
// // };
// // api.js
// const BASE_URL = "http://localhost:8000/api/auth";

// /**
//  * Register a new user
//  * @param {Object} data - { name, email, password }
//  * @returns {Object} JSON response from backend
//  */
// export const registerUser = async (data) => {
//   try {
//     const res = await fetch(`${BASE_URL}/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const json = await res.json();

//     if (!res.ok) {
//       // Throw error with message from backend
//       throw new Error(json.error || "Registration failed");
//     }

//     return json;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

// /**
//  * Login existing user
//  * @param {Object} data - { email, password }
//  * @returns {Object} JSON response from backend
//  */
// export const loginUser = async (data) => {
//   try {
//     const res = await fetch(`${BASE_URL}/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const json = await res.json();

//     if (!res.ok) {
//       // Throw error with message from backend
//       throw new Error(json.error || "Login failed");
//     }

//     return json;
//   } catch (err) {
//     return { error: err.message };
//   }
// };
// // api.js
// const BASE_URL = "http://localhost:8000/api/auth";

// /**
//  * Helper to safely parse JSON
//  * Returns parsed JSON if possible, otherwise returns raw text
//  */
// const safeParseJSON = async (res) => {
//   const contentType = res.headers.get("content-type");
//   if (contentType && contentType.includes("application/json")) {
//     return res.json();
//   } else {
//     const text = await res.text();
//     return { error: `Unexpected response: ${text}`, raw: text };
//   }
// };

// /**
//  * Register a new user
//  * @param {Object} data - { name, email, password }
//  * @returns {Object} JSON response or error
//  */
// export const registerUser = async (data) => {
//   try {
//     const res = await fetch(`${BASE_URL}/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const json = await safeParseJSON(res);

//     if (!res.ok) {
//       throw new Error(json.error || "Registration failed");
//     }

//     return json;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

// /**
//  * Login existing user
//  * @param {Object} data - { email, password }
//  * @returns {Object} JSON response or error
//  */
// export const loginUser = async (data) => {
//   try {
//     const res = await fetch(`${BASE_URL}/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const json = await safeParseJSON(res);

//     if (!res.ok) {
//       throw new Error(json.error || "Login failed");
//     }

//     // ✅ Auto-store token if login successful
//     if (json.token) {
//       localStorage.setItem("token", json.token);
//     }

//     return json;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

// /**
//  * Optional: fetch with token
//  */
// export const fetchWithToken = async (url, options = {}) => {
//   const token = localStorage.getItem("token");
//   const headers = {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   try {
//     const res = await fetch(url, { ...options, headers });
//     const json = await safeParseJSON(res);
//     if (!res.ok) throw new Error(json.error || "Request failed");
//     return json;
//   } catch (err) {
//     return { error: err.message };
//   }
// };
// const BASE_URL = "http://localhost:8000/api";

// // ─── Core fetch helper ────────────────────────────────────────────────────────
// const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");
//   const headers = {
//     ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
//   const contentType = res.headers.get("content-type");
//   const data = contentType?.includes("application/json") ? await res.json() : await res.text();

//   if (!res.ok) throw new Error(data?.error || data || `Request failed (${res.status})`);
//   return data;
// };

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// export const getCountries = () => apiFetch("/auth/countries");
// export const registerUser = (data) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
// export const loginUser = (data) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
// export const getMe = () => apiFetch("/auth/me");

// // ─── Users ────────────────────────────────────────────────────────────────────
// export const getUsers = () => apiFetch("/users");
// export const getManagers = () => apiFetch("/users/managers");
// export const createUser = (data) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) });
// export const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// // ─── Categories ───────────────────────────────────────────────────────────────
// export const getCategories = () => apiFetch("/categories");
// export const createCategory = (data) => apiFetch("/categories", { method: "POST", body: JSON.stringify(data) });
// export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: "DELETE" });

// // ─── Expenses ─────────────────────────────────────────────────────────────────
// export const getExpenses = (params = {}) => {
//   const q = new URLSearchParams(params).toString();
//   return apiFetch(`/expenses${q ? "?" + q : ""}`);
// };
// export const getExpense = (id) => apiFetch(`/expenses/${id}`);
// export const createExpense = (formData) => apiFetch("/expenses", { method: "POST", body: formData });
// export const updateExpense = (id, formData) => apiFetch(`/expenses/${id}`, { method: "PATCH", body: formData });
// export const submitExpense = (id) => apiFetch(`/expenses/${id}/submit`, { method: "POST" });
// export const cancelExpense = (id) => apiFetch(`/expenses/${id}`, { method: "DELETE" });
// export const getExpenseSummary = () => apiFetch("/expenses/stats/summary");

// // ─── Approvals ────────────────────────────────────────────────────────────────
// export const getApprovalQueue = () => apiFetch("/approvals/queue");
// export const getAllPending = () => apiFetch("/approvals/all");
// export const decideExpense = (expenseId, data) => apiFetch(`/approvals/${expenseId}/decide`, { method: "POST", body: JSON.stringify(data) });
// export const getApprovalHistory = () => apiFetch("/approvals/history");

// // ─── Rules ────────────────────────────────────────────────────────────────────
// export const getRules = () => apiFetch("/rules");
// export const createRule = (data) => apiFetch("/rules", { method: "POST", body: JSON.stringify(data) });
// export const updateRule = (id, data) => apiFetch(`/rules/${id}`, { method: "PUT", body: JSON.stringify(data) });
// export const deleteRule = (id) => apiFetch(`/rules/${id}`, { method: "DELETE" });

// // ─── OCR ──────────────────────────────────────────────────────────────────────
// export const scanReceipt = (formData) => apiFetch("/ocr/scan", { method: "POST", body: formData });
// export const confirmOcr = (ocrId, expense_id) => apiFetch(`/ocr/${ocrId}/confirm`, { method: "POST", body: JSON.stringify({ expense_id }) });
// api.js
// src/api.js

// const BASE_URL = "http://localhost:8000/api";

// /**
//  * Core fetch helper
//  * @param {string} endpoint - API endpoint
//  * @param {object} options - fetch options (method, headers, body, etc.)
//  * @returns {Promise<any>} JSON or text response
//  */
// const apiFetch = async (endpoint, options = {}) => {
//   try {
//     const token = localStorage.getItem("token");

//     let body = options.body;
//     const headers = { ...(options.headers || {}) };

//     // Handle JSON vs FormData
//     if (!(body instanceof FormData)) {
//       body = body ? JSON.stringify(body) : undefined;
//       headers["Content-Type"] = "application/json";
//     }

//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, body });
//     const contentType = res.headers.get("content-type");

//     let data;
//     if (contentType?.includes("application/json")) {
//       data = await res.json();
//     } else {
//       data = await res.text();
//     }

//     if (!res.ok) {
//       if (res.status === 401) {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//       }
//       const errorMsg = data?.error || (typeof data === "string" ? data : `Request failed (${res.status})`);
//       throw new Error(errorMsg);
//     }

//     return data;
//   } catch (err) {
//     console.error("API Error:", err.message);
//     throw err;
//   }
// };

// // ─── Auth ────────────────────────────────────────────────────────────────
// export const loginUser = (payload) => apiFetch("/auth/login", { method: "POST", body: payload });
// export const registerUser = (payload) => apiFetch("/auth/register", { method: "POST", body: payload });
// export const getMe = () => apiFetch("/auth/me");
// export const getCountries = () => apiFetch("/auth/countries");

// // ─── Users ────────────────────────────────────────────────────────────────
// export const getUsers = () => apiFetch("/users");
// export const getManagers = () => apiFetch("/users/managers");
// export const createUser = (payload) => apiFetch("/users", { method: "POST", body: payload });
// export const updateUser = (id, payload) => apiFetch(`/users/${id}`, { method: "PATCH", body: payload });

// // ─── Categories ───────────────────────────────────────────────────────────
// export const getCategories = () => apiFetch("/categories");
// export const createCategory = (payload) => apiFetch("/categories", { method: "POST", body: payload });
// export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: "DELETE" });

// // ─── Expenses ─────────────────────────────────────────────────────────────
// export const getExpenses = (params = {}) => {
//   const q = new URLSearchParams(params).toString();
//   return apiFetch(`/expenses${q ? "?" + q : ""}`);
// };
// export const getExpense = (id) => apiFetch(`/expenses/${id}`);
// export const createExpense = (formData) => apiFetch("/expenses", { method: "POST", body: formData });
// export const updateExpense = (id, formData) => apiFetch(`/expenses/${id}`, { method: "PATCH", body: formData });
// export const submitExpense = (id) => apiFetch(`/expenses/${id}/submit`, { method: "POST" });
// export const cancelExpense = (id) => apiFetch(`/expenses/${id}`, { method: "DELETE" });
// export const getExpenseSummary = () => apiFetch("/expenses/stats/summary");

// // ─── Approvals ────────────────────────────────────────────────────────────
// export const getApprovalQueue = () => apiFetch("/approvals/queue");
// export const getAllPending = () => apiFetch("/approvals/all");
// export const decideExpense = (expenseId, payload) =>
//   apiFetch(`/approvals/${expenseId}/decide`, { method: "POST", body: payload });
// export const getApprovalHistory = () => apiFetch("/approvals/history");

// // ─── Rules ────────────────────────────────────────────────────────────────
// export const getRules = () => apiFetch("/rules");
// export const createRule = (payload) => apiFetch("/rules", { method: "POST", body: payload });
// export const updateRule = (id, payload) => apiFetch(`/rules/${id}`, { method: "PUT", body: payload });
// export const deleteRule = (id) => apiFetch(`/rules/${id}`, { method: "DELETE" });

// // ─── OCR ──────────────────────────────────────────────────────────────────
// export const scanReceipt = (formData) => apiFetch("/ocr/scan", { method: "POST", body: formData });
// export const confirmOcr = (ocrId, expenseId) =>
//   apiFetch(`/ocr/${ocrId}/confirm`, { method: "POST", body: { expense_id: expenseId } });
// const BASE_URL = "http://localhost:8000/api";

// /**
//  * Core fetch helper
//  * @param {string} endpoint - API endpoint
//  * @param {object} options - fetch options (method, headers, body, etc.)
//  * @returns {Promise<any>} JSON or text response
//  */
// const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");

//   // Handle body: JSON unless it's FormData
//   let body = options.body;
//   const headers = { ...(options.headers || {}) };
//   if (!(body instanceof FormData)) {
//     body = body ? JSON.stringify(body) : undefined;
//     headers["Content-Type"] = "application/json";
//   }

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, body });
//   const contentType = res.headers.get("content-type");

//   let data;
//   if (contentType?.includes("application/json")) {
//     data = await res.json();
//   } else {
//     data = await res.text();
//   }

//   if (!res.ok) {
//     if (res.status === 401) {
//       // Auto logout on unauthorized
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     const errorMsg = data?.error || (typeof data === "string" ? data : `Request failed (${res.status})`);
//     throw new Error(errorMsg);
//   }

//   return data;
// };
// src/api.js

// const BASE_URL = "http://localhost:8000/api";

// /**
//  * Core fetch helper
//  * @param {string} endpoint - API endpoint (e.g., "/auth/register")
//  * @param {object} options - fetch options (method, headers, body, etc.)
//  * @returns {Promise<any>} JSON or text response
//  */
// const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");

//   // Handle body: JSON unless it's FormData
//   let body = options.body;
//   const headers = { ...(options.headers || {}) };
//   if (!(body instanceof FormData)) {
//     body = body ? JSON.stringify(body) : undefined;
//     headers["Content-Type"] = "application/json";
//   }

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, body });
//   const contentType = res.headers.get("content-type");

//   let data;
//   if (contentType?.includes("application/json")) {
//     data = await res.json();
//   } else {
//     data = await res.text();
//   }

//   if (!res.ok) {
//     if (res.status === 401) {
//       // Auto logout on unauthorized
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     const errorMsg = data?.error || (typeof data === "string" ? data : `Request failed (${res.status})`);
//     throw new Error(errorMsg);
//   }

//   return data;
// };

// /**
//  * Fetch all countries
//  * Returns an array of { code, name, currency, currencyName }
//  */
// export const getCountries = async () => {
//   // Temporary hardcoded fallback for testing
//   try {
//     return await apiFetch("/countries");
//   } catch (err) {
//     console.warn("Failed to fetch countries from backend, using dummy list.", err);
//     return [
//       { code: "US", name: "United States", currency: "USD", currencyName: "Dollar" },
//       { code: "IN", name: "India", currency: "INR", currencyName: "Rupee" },
//       { code: "GB", name: "United Kingdom", currency: "GBP", currencyName: "Pound" },
//       { code: "JP", name: "Japan", currency: "JPY", currencyName: "Yen" },
//       { code: "CA", name: "Canada", currency: "CAD", currencyName: "Dollar" },
//     ];
//   }
// };

// /**
//  * Register a new user
//  * @param {object} formData - { companyName, countryCode, name, email, password }
//  * @returns {Promise<{ token: string, user: object }>}
//  */
// export const registerUser = async (formData) => {
//   return apiFetch("/auth/register", {
//     method: "POST",
//     body: formData,
//   });
// };

// /**
//  * Login a user
//  * @param {object} credentials - { email, password }
//  * @returns {Promise<{ token: string, user: object }>}
//  */
// export const loginUser = async (credentials) => {
//   return apiFetch("/auth/login", {
//     method: "POST",
//     body: credentials,
//   });
// };


// src/api.js
// con

// const BASE_URL = "http://localhost:8000/api";

// // ─── Core fetch helper ────────────────────────────────────────────────────────
// const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");
//   const headers = {
//     ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
//   const contentType = res.headers.get("content-type");
//   const data = contentType?.includes("application/json") ? await res.json() : await res.text();

//   if (!res.ok) throw new Error(data?.error || data || `Request failed (${res.status})`);
//   return data;
// };

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// export const getCountries = () => apiFetch("/auth/countries");
// export const registerUser = (data) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
// export const loginUser = (data) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
// export const getMe = () => apiFetch("/auth/me");

// // ─── Users ────────────────────────────────────────────────────────────────────
// export const getUsers = () => apiFetch("/users");
// export const getManagers = () => apiFetch("/users/managers");
// export const createUser = (data) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) });
// export const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// // ─── Categories ───────────────────────────────────────────────────────────────
// export const getCategories = () => apiFetch("/categories");
// export const createCategory = (data) => apiFetch("/categories", { method: "POST", body: JSON.stringify(data) });
// export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: "DELETE" });

// // ─── Expenses ─────────────────────────────────────────────────────────────────
// export const getExpenses = (params = {}) => {
//   const q = new URLSearchParams(params).toString();
//   return apiFetch(`/expenses${q ? "?" + q : ""}`);
// };
// export const getExpense = (id) => apiFetch(`/expenses/${id}`);
// export const createExpense = (formData) => apiFetch("/expenses", { method: "POST", body: formData });
// export const updateExpense = (id, formData) => apiFetch(`/expenses/${id}`, { method: "PATCH", body: formData });
// export const submitExpense = (id) => apiFetch(`/expenses/${id}/submit`, { method: "POST" });
// export const cancelExpense = (id) => apiFetch(`/expenses/${id}`, { method: "DELETE" });
// export const getExpenseSummary = () => apiFetch("/expenses/stats/summary");

// // ─── Approvals ────────────────────────────────────────────────────────────────
// export const getApprovalQueue = () => apiFetch("/approvals/queue");
// export const getAllPending = () => apiFetch("/approvals/all");
// export const decideExpense = (expenseId, data) => apiFetch(`/approvals/${expenseId}/decide`, { method: "POST", body: JSON.stringify(data) });
// export const getApprovalHistory = () => apiFetch("/approvals/history");

// // ─── Rules ────────────────────────────────────────────────────────────────────
// export const getRules = () => apiFetch("/rules");
// export const createRule = (data) => apiFetch("/rules", { method: "POST", body: JSON.stringify(data) });
// export const updateRule = (id, data) => apiFetch(`/rules/${id}`, { method: "PUT", body: JSON.stringify(data) });
// export const deleteRule = (id) => apiFetch(`/rules/${id}`, { method: "DELETE" });

// // ─── OCR ──────────────────────────────────────────────────────────────────────
// export const scanReceipt = (formData) => apiFetch("/ocr/scan", { method: "POST", body: formData });
// export const confirmOcr = (ocrId, expense_id) => apiFetch(`/ocr/${ocrId}/confirm`, { method: "POST", body: JSON.stringify({ expense_id }) });
// api.js
// api.js
const BASE_URL = "http://localhost:8000";

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) throw new Error(data?.error || data || `Request failed (${res.status})`);
  return data;
};

// ─── Auth ─────────────────────────────────────────────
export const registerUser = (data) => apiFetch("/register", { method: "POST", body: JSON.stringify(data) });
export const loginUser = (data) => apiFetch("/login", { method: "POST", body: JSON.stringify(data) });
export const getMe = () => apiFetch("/me");
export const getCountries = () => apiFetch("/countries");

// ─── Users ────────────────────────────────────────────
export const getUsers = () => apiFetch("/users");
export const getManagers = () => apiFetch("/users/managers");
export const createUser = (data) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// ─── Categories ──────────────────────────────────────
export const getCategories = () => apiFetch("/categories");
export const createCategory = (data) => apiFetch("/categories", { method: "POST", body: JSON.stringify(data) });
export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: "DELETE" });

// ─── Expenses ────────────────────────────────────────
export const getExpenses = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/expenses${q ? "?" + q : ""}`);
};
export const getExpense = (id) => apiFetch(`/expenses/${id}`);
export const createExpense = (formData) => apiFetch("/expenses", { method: "POST", body: formData });
export const updateExpense = (id, formData) => apiFetch(`/expenses/${id}`, { method: "PATCH", body: formData });
export const submitExpense = (id) => apiFetch(`/expenses/${id}/submit`, { method: "POST" });
export const cancelExpense = (id) => apiFetch(`/expenses/${id}`, { method: "DELETE" });
export const getExpenseSummary = () => apiFetch("/expenses/stats/summary");

// ─── Approvals ───────────────────────────────────────
export const getApprovalQueue = () => apiFetch("/approvals/queue");
export const getAllPending = () => apiFetch("/approvals/all");
export const decideExpense = (expenseId, data) => apiFetch(`/approvals/${expenseId}/decide`, { method: "POST", body: JSON.stringify(data) });
export const getApprovalHistory = () => apiFetch("/approvals/history");

// ─── Rules ───────────────────────────────────────────
export const getRules = () => apiFetch("/rules");
export const createRule = (data) => apiFetch("/rules", { method: "POST", body: JSON.stringify(data) });
export const updateRule = (id, data) => apiFetch(`/rules/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRule = (id) => apiFetch(`/rules/${id}`, { method: "DELETE" });

// ─── OCR ─────────────────────────────────────────────
export const scanReceipt = (formData) => apiFetch("/ocr/scan", { method: "POST", body: formData });
export const confirmOcr = (ocrId, expense_id) => apiFetch(`/ocr/${ocrId}/confirm`, { method: "POST", body: JSON.stringify({ expense_id }) });