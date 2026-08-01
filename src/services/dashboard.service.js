const prisma = require("../config/prisma");

exports.getDashboardStats = async (user) => {
  const now = new Date();

  // Employee Dashboard
  if (user.role === "EMPLOYEE") {
    const where = {
      employeeId: user.id,
    };

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      highPriorityTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where,
      }),

      prisma.ticket.count({
        where: {
          ...where,
          status: {
            in: ["NEW", "ASSIGNED", "IN_PROGRESS"],
          },
        },
      }),

      prisma.ticket.count({
        where: {
          ...where,
          status: {
            in: ["RESOLVED", "CLOSED"],
          },
        },
      }),

      prisma.ticket.count({
        where: {
          ...where,
          priority: {
            in: ["HIGH", "CRITICAL"],
          },
        },
      }),
    ]);

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      highPriorityTickets,
    };
  }

  // IT Admin Dashboard
  const [
    totalTickets,
    newTickets,
    inProgressTickets,
    resolvedTickets,
    overdueTickets,
  ] = await Promise.all([
    prisma.ticket.count(),

    prisma.ticket.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.ticket.count({
      where: {
        status: {
          in: ["RESOLVED", "CLOSED"],
        },
      },
    }),

    prisma.ticket.count({
      where: {
        resolutionDueAt: {
          lt: now,
        },
        status: {
          notIn: ["RESOLVED", "CLOSED"],
        },
      },
    }),
  ]);


  
  return {
    totalTickets,
    newTickets,
    inProgressTickets,
    resolvedTickets,
    overdueTickets,
  };
};

// ==============================
// Dashboard Charts
// ==============================
exports.getDashboardCharts = async (user) => {
  const where =
    user.role === "EMPLOYEE"
      ? { employeeId: user.id }
      : {};

  const statusData = await prisma.ticket.groupBy({
    by: ["status"],
    where,
    _count: {
      status: true,
    },
  });

  const priorityData = await prisma.ticket.groupBy({
    by: ["priority"],
    where,
    _count: {
      priority: true,
    },
  });

  const tickets = await prisma.ticket.findMany({
    where,
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const monthlyMap = {};

  tickets.forEach((ticket) => {
    const month = ticket.createdAt.toLocaleString("en-US", {
      month: "short",
    });

    monthlyMap[month] =
      (monthlyMap[month] || 0) + 1;
  });

  return {
    status: statusData,
    priority: priorityData,
    monthly: monthlyMap,
  };
};