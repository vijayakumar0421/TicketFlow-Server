const reportsService = require("../services/reports.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const getReportData = async (req, res) => {
  try {
    const report = await reportsService.getReportData(req.body);

    return successResponse(
      res,
      "Report generated successfully.",
      report
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getReportData,
};