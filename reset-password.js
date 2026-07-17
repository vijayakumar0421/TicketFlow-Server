const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  await prisma.user.update({
    where: {
      email: "john@ticketflow.com",
    },
    data: {
      password,
    },
  });


}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });