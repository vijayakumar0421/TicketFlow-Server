const dashboardService = require("../services/dashboard.service");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};