const prisma = require("../config/prisma");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../config/jwt");

const login = async (email, password) => {
  console.log("========== LOGIN START ==========");
  console.log("Email:", email);

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Department: {
          include: {
            Organization: true,
          },
        },
      },
    });

    console.log("User found:", user);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password
    );

    console.log("Password Valid:", isPasswordValid);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    console.log("Login Success");
    console.log("=========== LOGIN END ===========");

    return {
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.Department?.name,
        organization: user.Department?.Organization?.name,
      },
    };
  } catch (err) {
    console.error("========== LOGIN ERROR ==========");
    console.error(err);
    console.error("=================================");
    throw err;
  }
};

const getCurrentUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    return {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.Department?.name,
      organization: user.Department?.Organization?.name,
    };
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);
    throw err;
  }
};

module.exports = {
  login,
  getCurrentUser,
};