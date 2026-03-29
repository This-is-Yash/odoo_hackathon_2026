// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const pool = require("../db");

// const router = express.Router();

// // REGISTER
// // router.post("/register", async (req, res) => {
// //   try {
// //     const { email, password, name, role } = req.body;

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const roleValue = role.toLowerCase(); // 👈 FIX

// // // const result = await pool.query(
// // //   `INSERT INTO users (email, password_hash, name, role)
// // //    VALUES ($1, $2, $3, $4)
// // //    RETURNING id, email, role`,
// // //   [email, hashedPassword, name, roleValue]
// // // );

// //     const result = await pool.query(
// //       `INSERT INTO users (email, password_hash, name, role, company_id)
// //        VALUES ($1, $2, $3, $4, $5)
// //        RETURNING id, email, role`,
// //       [email, hashedPassword, name, roleValue,companyId]
// //     );

// //     res.json({ user: result.rows[0] });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Registration failed" });
// //   }
// // });
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // 🔥 Get company automatically
//     const companyRes = await pool.query(
//       "SELECT id FROM companies LIMIT 1"
//     );

//     const companyId = companyRes.rows[0].id;

//     const result = await pool.query(
//       `INSERT INTO users (name, email, password_hash, role, company_id)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [name, email, password, role, companyId]
//     );

//     res.json(result.rows[0]);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const userRes = await pool.query(
//       "SELECT * FROM users WHERE email=$1",
//       [email]
//     );

//     if (userRes.rows.length === 0) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     const user = userRes.rows[0];

//     const valid = await bcrypt.compare(password, user.password_hash);

//     if (!valid) {
//       return res.status(400).json({ error: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// module.exports = router;
// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// ----------------------
// REGISTER
// ----------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔹 Get company automatically
    const companyRes = await pool.query("SELECT id FROM companies LIMIT 1");
    const companyId = companyRes.rows[0].id;

    // 🔹 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, company_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, company_id`,
      [name, email, hashedPassword, role.toLowerCase(), companyId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ----------------------
// LOGIN
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // 🔹 Sign JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;