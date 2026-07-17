const prisma = require("../config/prisma");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../config/jwt");

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department.name,
    },
  };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department.name,
  };
};

module.exports = {
  login,
  getCurrentUser,
};