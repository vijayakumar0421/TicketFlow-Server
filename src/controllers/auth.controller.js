const authService = require("../services/auth.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return successResponse(res, "Login successful", result);
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return successResponse(
      res,
      "User fetched successfully",
      user
    );
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  login,
  getCurrentUser,
};