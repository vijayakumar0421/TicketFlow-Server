const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const organizationService = require("../services/organization.service");

const getOrganizations = async (req, res) => {
  try {
    const organizations =
      await organizationService.getOrganizations();

    return successResponse(
      res,
      "Organizations fetched successfully",
      organizations
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const createOrganization = async (req, res) => {
  try {
    const organization =
      await organizationService.createOrganization(req.body);

    return successResponse(
      res,
      "Organization created successfully",
      organization
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getOrganizations,
  createOrganization,
};