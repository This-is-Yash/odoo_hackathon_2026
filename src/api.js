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
// api.js
const BASE_URL = "http://localhost:8000/api/auth";

/**
 * Helper to safely parse JSON
 * Returns parsed JSON if possible, otherwise returns raw text
 */
const safeParseJSON = async (res) => {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    return { error: `Unexpected response: ${text}`, raw: text };
  }
};

/**
 * Register a new user
 * @param {Object} data - { name, email, password }
 * @returns {Object} JSON response or error
 */
export const registerUser = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await safeParseJSON(res);

    if (!res.ok) {
      throw new Error(json.error || "Registration failed");
    }

    return json;
  } catch (err) {
    return { error: err.message };
  }
};

/**
 * Login existing user
 * @param {Object} data - { email, password }
 * @returns {Object} JSON response or error
 */
export const loginUser = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await safeParseJSON(res);

    if (!res.ok) {
      throw new Error(json.error || "Login failed");
    }

    // ✅ Auto-store token if login successful
    if (json.token) {
      localStorage.setItem("token", json.token);
    }

    return json;
  } catch (err) {
    return { error: err.message };
  }
};

/**
 * Optional: fetch with token
 */
export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await safeParseJSON(res);
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json;
  } catch (err) {
    return { error: err.message };
  }
};