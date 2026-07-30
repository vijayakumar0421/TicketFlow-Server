const userService = require("../services/user.service");
const userImportService = require("../services/userImport.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

// Create User
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    return successResponse(
      res,
      "User created successfully",
      user
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Validate Import Users
const validateImportUsers = async (req, res) => {
  try {
    const result =
      await userImportService.validateImportUsers(req.body);

    return successResponse(
      res,
      "Validation completed.",
      result
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Import Users
const importUsers = async (req, res) => {
  try {
    const result =
      await userImportService.importUsers(req.body);

    return successResponse(
      res,
      `${result.imported} users imported successfully.`,
      result
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      organization,
      department,
      role,
      status,
    } = req.query;

    const users = await userService.getAllUsers(
      page,
      limit,
      {
        search,
        organization,
        department,
        role,
        status,
      }
    );

    return successResponse(
      res,
      "Users fetched successfully",
      users
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get User Stats
const getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();

    return successResponse(
      res,
      "User statistics fetched successfully",
      stats
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get User Filter Options
const getUserFilterOptions = async (req, res) => {
  try {
    const filterOptions =
      await userService.getUserFilterOptions();

    return successResponse(
      res,
      "User filter options fetched successfully",
      filterOptions
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  try {
    const user =
      await userService.getUserById(req.params.id);

    return successResponse(
      res,
      "User fetched successfully",
      user
    );
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    return successResponse(
      res,
      "User updated successfully",
      user
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    return successResponse(
      res,
      "User deleted successfully"
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Get IT Support Users
const getITSupportUsers = async (req, res) => {
  try {
    const users = await userService.getITSupportUsers();

    return successResponse(
      res,
      "IT Support users fetched successfully",
      users
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    return successResponse(
      res,
      "Password updated successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      400,
      error.message
    );
  }
};

module.exports = {
  createUser,
  validateImportUsers,
  importUsers,
  getAllUsers,
  getUserStats,
  getUserFilterOptions,
  getITSupportUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
};