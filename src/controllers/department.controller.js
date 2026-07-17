const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const departmentService = require("../services/department.service");

const getDepartments = async (req, res) => {
  try {
    const departments =
      await departmentService.getDepartments();

    return successResponse(
      res,
      "Departments fetched successfully",
      departments
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const createDepartment = async (req, res) => {
  try {
    const department =
      await departmentService.createDepartment(req.body);

    return successResponse(
      res,
      "Department created successfully",
      department
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
};