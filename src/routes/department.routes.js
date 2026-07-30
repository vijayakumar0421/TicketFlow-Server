const express = require("express");

const router = express.Router();

const departmentController = require("../controllers/department.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  departmentController.getDepartments
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  departmentController.createDepartment
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  departmentController.deleteDepartment
);


module.exports = router;