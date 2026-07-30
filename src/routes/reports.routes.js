const express = require("express");

const router = express.Router();

const reportsController = require("../controllers/reports.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

// ==============================
// Generate Reports
// ==============================
router.post(
  "/",
  authenticate,
  reportsController.getReportData
);

module.exports = router;