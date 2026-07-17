const prisma = require("../config/prisma");

const getDepartments = async () => {
  return await prisma.department.findMany({
    include: {
      organization: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const createDepartment = async (data) => {
  const organization =
    await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const exists =
    await prisma.department.findFirst({
      where: {
        organizationId: data.organizationId,
        name: data.name,
      },
    });

  if (exists) {
    throw new Error(
      "Department already exists."
    );
  }

  return await prisma.department.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,
    },
  });
};

module.exports = {
  getDepartments,
  createDepartment,
};