const { PrismaClient } = require("@prisma/client");

console.log("DATABASE_URL FROM PRISMA:");
console.log(process.env.DATABASE_URL);

const prisma = new PrismaClient();

module.exports = prisma;