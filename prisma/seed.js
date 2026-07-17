const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // -----------------------------
  // Organizations
  // -----------------------------
  const digiPro = await prisma.organization.upsert({
    where: { code: "DIGI" },
    update: {},
    create: {
      name: "DigiPro",
      code: "DIGI",
      description: "Software Development Company",
    },
  });

  const insurePro = await prisma.organization.upsert({
    where: { code: "INS" },
    update: {},
    create: {
      name: "InsurePro",
      code: "INS",
      description: "Insurance Company",
    },
  });

  // -----------------------------
  // DigiPro Departments
  // -----------------------------
  const digiDepartments = [
    "IT Support",
    "Development",
    "Design",
    "Marketing",
    "Human Resources",
    "Finance",
    "Sales",
  ];

  for (const name of digiDepartments) {
    await prisma.department.upsert({
      where: {
        organizationId_name: {
          organizationId: digiPro.id,
          name,
        },
      },
      update: {},
      create: {
        organizationId: digiPro.id,
        name,
        description: `${name} Department`,
      },
    });
  }

  // -----------------------------
  // InsurePro Departments
  // -----------------------------
  const insureDepartments = [
    "Customer Support",
    "Claims",
    "Operations",
    "Underwriting",
    "Risk Management",
    "Finance",
    "Sales",
  ];

  for (const name of insureDepartments) {
    await prisma.department.upsert({
      where: {
        organizationId_name: {
          organizationId: insurePro.id,
          name,
        },
      },
      update: {},
      create: {
        organizationId: insurePro.id,
        name,
        description: `${name} Department`,
      },
    });
  }

  // -----------------------------
  // Admin User
  // -----------------------------
  const itSupportDepartment =
    await prisma.department.findFirst({
      where: {
        organizationId: digiPro.id,
        name: "IT Support",
      },
    });

  const adminExists = await prisma.user.findUnique({
    where: {
      email: "admin@ticketflow.com",
    },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        employeeId: "EMP001",
        name: "System Administrator",
        email: "admin@ticketflow.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        departmentId: itSupportDepartment.id,
      },
    });


  } else {

  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });