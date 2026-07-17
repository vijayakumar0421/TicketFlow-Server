const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");

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

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
  select: {
    id: true,
    employeeId: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    department: {
      select: {
        id: true,
        name: true,
        organization: {
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
});

  return users;
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      department: {
        include: {
          organization: true,
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
      department: {
        include: {
          organization: true,
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};