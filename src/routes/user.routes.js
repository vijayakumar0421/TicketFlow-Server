const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

// ===================== Get All Users =====================

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  userController.getAllUsers
);

// ===================== Get IT Support Users =====================

router.get(
  "/it-support",
  authenticate,
  authorize("ADMIN", "IT_SUPPORT"),
  userController.getITSupportUsers
);

// ===================== Get User Stats =====================

router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  userController.getUserStats
);

// ===================== Get User Filter Options =====================

router.get(
  "/filter-options",
  authenticate,
  authorize("ADMIN"),
  userController.getUserFilterOptions
);

// ===================== Get Single User =====================

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.getUserById
);

// ===================== Create User =====================

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  userController.createUser
);

// ===================== Import Users =====================

router.post(
  "/import",
  authenticate,
  authorize("ADMIN"),
  userController.importUsers
);

router.post(
  "/import/validate",
  authenticate,
  authorize("ADMIN"),
  userController.validateImportUsers
);

// ===================== Change Password =====================

router.put(
  "/change-password",
  authenticate,
  userController.changePassword
);

// ===================== Update User =====================

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.updateUser
);

// ===================== Delete User =====================

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.deleteUser
);

module.exports = router;