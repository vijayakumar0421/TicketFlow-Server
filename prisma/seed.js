const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("=================================");
  console.log("🚀 TicketFlow Seed Started");
  console.log("=================================");

  const hashedPassword = await bcrypt.hash("Admin@12345", 10);

  // -----------------------------
  // Organizations
  // -----------------------------
  console.log("Creating Organizations...");

  const digiPro = await prisma.organization.upsert({
    where: { code: "DIGI" },
    update: {},
    create: {
      name: "DigiPro",
      code: "DIGI",
      description: "Software Development Company",
      updatedAt: new Date(),
    },
  });

  console.log("✅ DigiPro Created:", digiPro);

  const insurePro = await prisma.organization.upsert({
    where: { code: "INS" },
    update: {},
    create: {
      name: "InsurePro",
      code: "INS",
      description: "Insurance Company",
      updatedAt: new Date(),
    },
  });

  console.log("✅ InsurePro Created:", insurePro);

  // -----------------------------
  // DigiPro Departments
  // -----------------------------
  console.log("Creating DigiPro Departments...");

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
        updatedAt: new Date(),
      },
    });

    console.log(`✅ ${name}`);
  }

  // -----------------------------
  // InsurePro Departments
  // -----------------------------
  console.log("Creating InsurePro Departments...");

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
        updatedAt: new Date(),
      },
    });

    console.log(`✅ ${name}`);
  }

  // -----------------------------
  // Find IT Support Department
  // -----------------------------
  console.log("Finding IT Support Department...");

  const itSupportDepartment = await prisma.department.findFirst({
    where: {
      organizationId: digiPro.id,
      name: "IT Support",
    },
  });

  console.log("Department Found:", itSupportDepartment);

  if (!itSupportDepartment) {
    throw new Error("IT Support department not found.");
  }

  // -----------------------------
  // Admin User
  // -----------------------------
  console.log("Checking Admin User...");

  await prisma.user.upsert({
  where: {
    employeeId: "EMP001",
  },
  update: {
    email: "vijayakumar@digi-pro.co",
    password: hashedPassword,
    name: "System Administrator",
    role: "ADMIN",
    status: "ACTIVE",
    departmentId: itSupportDepartment.id,
    updatedAt: new Date(),
  },
  create: {
    employeeId: "EMP001",
    name: "System Administrator",
    email: "vijayakumar@digi-pro.co",
    password: hashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
    departmentId: itSupportDepartment.id,
    updatedAt: new Date(),
  },
});

console.log("✅ Admin user created/updated");

  // -----------------------------
  // Default SLA Policy
  // -----------------------------
  //console.log("Checking Default SLA Policy...");

  //const slaPolicy = await prisma.slapolicy.findFirst();

  //if (!slaPolicy) {
    //await prisma.slapolicy.create({
      //data: {
      //  firstResponseHours: 2,
        //resolutionHours: 24,
      //},
   // });

  //  console.log("✅ Default SLA Policy Created (2h / 24h)");
  //} else {
  //  console.log("ℹ️ SLA Policy already exists.");
 // }

  console.log("=================================");
  console.log("🎉 TicketFlow Seed Completed");
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });