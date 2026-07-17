const { PrismaClient } = require("@prisma/client");

console.log("Prisma DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

module.exports = prisma;