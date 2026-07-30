const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const organizationRoutes = require("./routes/organization.routes");
const departmentRoutes = require("./routes/department.routes");
const categoryRoutes = require("./routes/category.routes");
const ticketRoutes = require("./routes/ticket.routes");
const reportsRoutes = require("./routes/reports.routes");

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TicketFlow Backend is running 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/organizations", organizationRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/reports", reportsRoutes);

// Debug Database Connection
app.get("/api/debug-db", async (req, res) => {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      databaseUrl: process.env.DATABASE_URL,
      message: "Database connection successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      databaseUrl: process.env.DATABASE_URL,
      error: error.message,
      code: error.code,
    });
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = app;