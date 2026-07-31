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

// CORS
app.use(cors());

// Body Parser
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

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TicketFlow Backend  is running 🚀",
  });
});

// Health Check
app.get("//health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TicketFlow Backend is running 🚀",
  });
});

//  Routes
app.use("//auth", authRoutes);
app.use("//users", userRoutes);
app.use("//organizations", organizationRoutes);
app.use("//departments", departmentRoutes);
app.use("//categories", categoryRoutes);
app.use("//tickets", ticketRoutes);
app.use("//reports", reportsRoutes);

// Database Connection Test
app.get("//debug-db", async (req, res) => {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  } finally {
    await prisma.$disconnect();
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;