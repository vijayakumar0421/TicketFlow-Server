const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const organizationRoutes = require("./routes/organization.routes");
const departmentRoutes = require("./routes/department.routes");
const categoryRoutes = require("./routes/category.routes");
const ticketRoutes = require("./routes/ticket.routes");
const reportsRoutes = require("./routes/reports.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

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

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TicketFlow Backend is running 🚀",
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TicketFlow Backend is running 🚀",
  });
});

// Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Database Connection Test
app.get("/api/debug-db", async (req, res) => {
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

const fs = require("fs");

app.get("/api/debug/uploads", (req, res) => {
  const uploadPath = path.join(__dirname, "../uploads");

  res.json({
    uploadPath,
    exists: fs.existsSync(uploadPath),
    files: fs.existsSync(uploadPath)
      ? fs.readdirSync(uploadPath)
      : [],
  });
});

app.get("/api/debug/categories", async (req, res) => {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const categories = await prisma.category.findMany({
      include: {
        Organization: true,
      },
      orderBy: [
        {
          organizationId: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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