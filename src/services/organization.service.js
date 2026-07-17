const prisma = require("../config/prisma");

const getOrganizations = async () => {
  return await prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

const createOrganization = async (data) => {
  const exists = await prisma.organization.findFirst({
    where: {
      OR: [
        { name: data.name },
        { code: data.code },
      ],
    },
  });

  if (exists) {
    throw new Error(
      "Organization name or code already exists."
    );
  }

  return await prisma.organization.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,
    },
  });
};

module.exports = {
  getOrganizations,
  createOrganization,
};