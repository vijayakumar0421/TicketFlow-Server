const dashboardService = require("../services/dashboard.service");

// ==============================
// Dashboard Statistics
// ==============================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats =
      await dashboardService.getDashboardStats(
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Dashboard statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// Dashboard Charts
// ==============================
exports.getDashboardCharts = async (req, res, next) => {
  try {
    const charts =
      await dashboardService.getDashboardCharts(
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Dashboard charts fetched successfully.",
      data: charts,
    });
  } catch (error) {
    next(error);
  }
};