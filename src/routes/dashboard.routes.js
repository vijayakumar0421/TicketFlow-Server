const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

// ==============================
// Dashboard Statistics
// ==============================
router.get(
  "/stats",
  authenticate,
  dashboardController.getDashboardStats
);

// ==============================
// Dashboard Charts
// ==============================
router.get(
  "/charts",
  authenticate,
  dashboardController.getDashboardCharts
);

module.exports = router;