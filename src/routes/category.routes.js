const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/category.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

// Get All Categories
router.get(
  "/",
  authenticate,
  categoryController.getCategories
);

// Get Category By ID
router.get(
  "/:id",
  authenticate,
  categoryController.getCategoryById
);

// Create Category
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  categoryController.createCategory
);

// Update Category
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.updateCategory
);

// Delete Category
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.deleteCategory
);

module.exports = router;