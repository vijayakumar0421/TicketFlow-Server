const express = require("express");

const router = express.Router();

const organizationController = require("../controllers/organization.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  organizationController.getOrganizations
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  organizationController.createOrganization
);

module.exports = router;