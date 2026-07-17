const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");

const validateImportUsers = async (users) => {
  const errors = [];
  const validUsers = [];

  for (let i = 0; i < users.length; i++) {
    const row = users[i];

    const employeeId = row["Employee ID"]?.trim();
    const name = row["Full Name"]?.trim();
    const email = row["Email"]?.trim().toLowerCase();
    const organization = row["Organization"]?.trim();
    const department = row["Department"]?.trim();
    const role = row["Role"]?.trim();
    const password = row["Password"]?.trim();
    const status = row["Status"]?.trim();

    if (
      !employeeId ||
      !name ||
      !email ||
      !organization ||
      !department ||
      !role ||
      !password ||
      !status
    ) {
      errors.push({
        row: i + 2,
        message: "All fields are required.",
      });
      continue;
    }

    const organizationData =
      await prisma.organization.findUnique({
        where: {
          name: organization,
        },
      });

    if (!organizationData) {
      errors.push({
        row: i + 2,
        message: `Organization '${organization}' not found.`,
      });
      continue;
    }

    const departmentData =
      await prisma.department.findFirst({
        where: {
          organizationId: organizationData.id,
          name: department,
        },
      });

    if (!departmentData) {
      errors.push({
        row: i + 2,
        message: `Department '${department}' not found.`,
      });
      continue;
    }

    const existingEmail =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      errors.push({
        row: i + 2,
        message: `Email '${email}' already exists.`,
      });
      continue;
    }

    const existingEmployee =
      await prisma.user.findUnique({
        where: {
          employeeId,
        },
      });

    if (existingEmployee) {
      errors.push({
        row: i + 2,
        message: `Employee ID '${employeeId}' already exists.`,
      });
      continue;
    }

    validUsers.push({
      employeeId,
      name,
      email,
      password,
      role,
      status,
      departmentId: departmentData.id,
    });
  }

  return {
    valid: validUsers.length,
    invalid: errors.length,
    validUsers,
    errors,
  };
};

const importUsers = async (users) => {
  const validation =
    await validateImportUsers(users);

  const createdUsers = [];

  for (const user of validation.validUsers) {
    const hashedPassword =
      await hashPassword(user.password);

    const createdUser =
      await prisma.user.create({
        data: {
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
        },
      });

    createdUsers.push(createdUser);
  }

  return {
      imported: createdUsers.length,
    skipped: validation.invalid,
    errors: validation.errors,
  };
};

module.exports = {
  validateImportUsers,
  importUsers,
};