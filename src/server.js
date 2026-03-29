// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const authRoutes = require("./routes/auth");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/", authRoutes);

// app.get("/", (req, res) => {
//   res.send("API Running...");
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Mount auth routes correctly
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});