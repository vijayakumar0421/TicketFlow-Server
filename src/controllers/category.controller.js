const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const categoryService = require("../services/category.service");

const getCategories = async (req, res) => {
  try {
    const categories =
      await categoryService.getCategories();

    return successResponse(
      res,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const createCategory = async (req, res) => {
  try {
    const category =
      await categoryService.createCategory(req.body);

    return successResponse(
      res,
      "Category created successfully",
      category
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Get Category By ID
const getCategoryById = async (req, res) => {
  try {
    const category =
      await categoryService.getCategoryById(
        Number(req.params.id)
      );

    return successResponse(
      res,
      "Category fetched successfully",
      category
    );
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const category =
      await categoryService.updateCategory(
        Number(req.params.id),
        req.body
      );

    return successResponse(
      res,
      "Category updated successfully",
      category
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(
      Number(req.params.id)
    );

    return successResponse(
      res,
      "Category deleted successfully"
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};