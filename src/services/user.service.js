const {
  getPagination,
} = require("../utils/pagination");
const prisma = require("../config/prisma");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const createUser = async (data) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { employeeId: data.employeeId },
      ],
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      status: data.status,
      departmentId: Number(data.departmentId),
    },
  });

  return user;
};

const getAllUsers = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  const { skip, limit: take, page: currentPage } =
    getPagination(page, limit);

    const {
      search,
      organization,
      department,
      role,
      status,
    } = filters;

    const where = {};

// Search by Employee ID or Name
if (search) {
  where.OR = [
    {
      employeeId: {
        contains: search,
      },
    },
    {
      name: {
        contains: search,
      },
    },
  ];
}

// Organization
if (
  organization &&
  organization !== "All Organizations"
) {
  where.Department = {
    Organization: {
      name: organization,
    },
  };
}

// Department
if (
  department &&
  department !== "All Departments"
) {
  where.Department = {
  ...(where.Department || {}),
  name: department,
};
}

// Role
if (role && role !== "All Roles") {
  where.role = role;
}

// Status
if (
  status &&
  status !== "All Status"
) {
  where.status = status;
}

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        Department: {
          select: {
            id: true,
            name: true,
            Organization: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    items: users,

    pagination: {
      page: currentPage,
      limit: take,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
      hasNextPage:
        currentPage < Math.ceil(totalItems / take),
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getUserStats = async () => {
    const [
    totalUsers,
    employees,
    itSupport,
    admins,
    organizations,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    }),

    prisma.user.count({
      where: {
        role: "IT_SUPPORT",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.organization.count(),
  ]);

  return {
    totalUsers,
    employees,
    itSupport,
    admins,
    organizations,
  };
};

const getUserFilterOptions = async () => {
  const [
    organizations,
    departments,
  ] = await Promise.all([
    prisma.organization.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    organizations: [
    ...new Set(organizations.map((item) => item.name)),
  ],

    departments: [
      ...new Set(departments.map((item) => item.name)),
    ],

    roles: [
      "ADMIN",
      "IT_SUPPORT",
      "EMPLOYEE",
    ],

    statuses: [
      "ACTIVE",
      "INACTIVE",
    ],
  };
};

const getITSupportUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: "IT_SUPPORT",
      status: "ACTIVE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};


const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      Department: {
        include: {
          Organization: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUser = async (id, data) => {
  const updateData = {
    employeeId: data.employeeId,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    departmentId: Number(data.departmentId),
  };

  // Update password only if a new password is entered
  if (data.password?.trim()) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: updateData,
    include: {
      Department: {
        include: {
          Organization: true,
        },
      },
    },
  });

  return user;
};

const deleteUser = async (id) => {
  await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });

  return true;
};

const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    throw new Error("All fields are required.");
  }

  if (newPassword.length < 8) {
    throw new Error(
      "New password must be at least 8 characters."
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect.");
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "New password cannot be the same as the current password."
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      password: hashedPassword,
    },
  });

  return true;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserStats,
  getUserFilterOptions,
  getITSupportUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
};