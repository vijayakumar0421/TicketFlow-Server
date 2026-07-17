const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

// Get All Users
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  userController.getAllUsers
);

// Get Single User
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.getUserById
);

// Create User
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  userController.createUser
);

// Import Users
router.post(
  "/import",
  authenticate,
  authorize("ADMIN"),
  userController.importUsers
);

// Update User
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.updateUser
);

// Delete User
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.deleteUser
);

router.post(
  "/import/validate",
  authenticate,
  authorize("ADMIN"),
  userController.validateImportUsers
);

module.exports = router;