// routes/countries.js
import express from "express";
const router = express.Router();

// Example list of countries
const countries = [
  { code: "US", name: "United States", currency: "USD", currencyName: "Dollar" },
  { code: "IN", name: "India", currency: "INR", currencyName: "Rupee" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencyName: "Pound" },
  { code: "JP", name: "Japan", currency: "JPY", currencyName: "Yen" },
  { code: "CA", name: "Canada", currency: "CAD", currencyName: "Dollar" },
];

router.get("/", (req, res) => {
  res.json(countries);
});

export default router;