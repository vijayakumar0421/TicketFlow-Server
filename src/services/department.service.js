const prisma = require("../config/prisma");

const getDepartments = async () => {
  return await prisma.department.findMany({
    include: {
      Organization: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const createDepartment = async (data) => {
  const organizationId = Number(data.organizationId);

  const organization =
    await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const exists =
    await prisma.department.findFirst({
      where: {
        organizationId,
        name: data.name,
      },
    });

  if (exists) {
    throw new Error("Department already exists.");
  }

  return await prisma.department.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description,
      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,
    },
  });
};

const updateDepartment = async (id, data) => {
  const department = await prisma.department.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  const organizationId = Number(data.organizationId);

  const organization =
    await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const exists =
    await prisma.department.findFirst({
      where: {
        organizationId,
        name: data.name,
        NOT: {
          id: Number(id),
        },
      },
    });

  if (exists) {
    throw new Error("Department already exists.");
  }

  return await prisma.department.update({
    where: {
      id: Number(id),
    },
    data: {
      organizationId,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });
};

const deleteDepartment = async (id) => {
  id = Number(id);

  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  const userCount = await prisma.user.count({
    where: {
      departmentId: id,
    },
  });

  if (userCount > 0) {
    throw new Error(
      "This department cannot be deleted because users are assigned to it."
    );
  }

  await prisma.department.delete({
    where: { id },
  });

  return true;
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};