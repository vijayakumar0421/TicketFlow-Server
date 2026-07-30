const prisma = require("../config/prisma");

/**
 * ----------------------------------------
 * Build Report Filters
 * ----------------------------------------
 */
const buildReportFilters = (filters = {}) => {
  const {
    search,
    organization,
    status,
    priority,
    category,
    department,
    assignedTo,
    fromDate,
    toDate,
  } = filters;

  const where = {};

  // -------------------------
  // Search
  // -------------------------
  if (search) {
    where.OR = [
      {
        ticketNumber: {
            contains: search,
            },
      },
      {
        title: {
          contains: search,

        },
      },
    ];
  }

  // -------------------------
  // Organization
  // -------------------------
  if (
    organization &&
    organization !== "All Organizations"
  ) {
    where.category = {
    organizationId: Number(organization),
    };
  }

  // -------------------------
  // Status
  // -------------------------
  if (
    status &&
    status !== "All Status"
  ) {
    where.status = status;
  }

  // -------------------------
  // Priority
  // -------------------------
  if (
    priority &&
    priority !== "All Priority"
  ) {
    where.priority = priority;
  }

  // -------------------------
  // Category
  // -------------------------
  if (
    category &&
    category !== "All Categories"
  ) {
    where.category = {
      ...(where.category || {}),
      id: Number(category),
    };
  }

  // -------------------------
  // Department
  // -------------------------
  if (
    department &&
    department !== "All Departments"
  ) {
    where.user_ticket_employeeIdTouser = {
      departmentId: Number(department),
    };
  }

  // -------------------------
  // Assigned Engineer
  // -------------------------
  if (
    assignedTo &&
    assignedTo !== "All IT Support"
  ) {
    where.user_ticket_assignedToIdTouser = {
      id: Number(assignedTo),
    };
  }

  // -------------------------
  // Date Range
  // -------------------------
  if (fromDate || toDate) {
    where.createdAt = {};

    if (fromDate) {
      where.createdAt.gte = new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt.lte = endDate;
    }
  }

  return where;
};

/**
 * ----------------------------------------
 * Calculate Average Resolution Time
 * ----------------------------------------
 */
const calculateAverageResolutionTime = (
  tickets
) => {
  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.timeSpentMinutes &&
      ticket.timeSpentMinutes > 0
  );

  if (!resolvedTickets.length) {
    return 0;
  }

  const totalMinutes = resolvedTickets.reduce(
    (sum, ticket) =>
      sum + ticket.timeSpentMinutes,
    0
  );

  return Math.round(
    totalMinutes / resolvedTickets.length
  );
};

/**
 * ----------------------------------------
 * Format Minutes
 * Example:
 * 135 -> 2h 15m
 * ----------------------------------------
 */
const formatMinutes = (minutes) => {
  if (!minutes) {
    return "0m";
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) {
    return `${mins}m`;
  }

  return `${hrs}h ${mins}m`;
};

/**
 * ----------------------------------------
 * Calculate SLA Performance
 * ----------------------------------------
 */
const calculateSlaPerformance = (
  tickets
) => {
  let met = 0;
  let breached = 0;

  tickets.forEach((ticket) => {
    if (
    !["RESOLVED", "CLOSED"].includes(ticket.status) ||
    !ticket.resolvedAt
    ) {
    return;
    }

    if (
      ticket.resolvedAt &&
      ticket.resolutionDueAt &&
      ticket.resolvedAt <= ticket.resolutionDueAt
    ) {
      met++;
    } else {
      breached++;
    }
  });

  const total = met + breached;

  return {
    met,
    breached,
    percentage:
      total === 0
        ? 0
        : Math.round((met / total) * 100),
  };
};
/**
 * ----------------------------------------
 * Get Report Data
 * ----------------------------------------
 */
const getReportData = async (filters = {}) => {
  const where = buildReportFilters(filters);

  const tickets = await prisma.ticket.findMany({
    where,

    include: {
      category: {
        include: {
          organization: true,
        },
      },

      user_ticket_employeeIdTouser: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      user_ticket_assignedToIdTouser: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ----------------------------------------
  // Summary Counts
  // ----------------------------------------

  const totalTickets = tickets.length;

  const openTickets = tickets.filter((ticket) =>
    ["NEW", "ASSIGNED", "IN_PROGRESS", "REOPENED"].includes(
      ticket.status
    )
  ).length;

  const closedTickets = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(ticket.status)
  ).length;

  const averageResolutionMinutes =
    calculateAverageResolutionTime(tickets);

  const sla = calculateSlaPerformance(tickets);

  // ----------------------------------------
  // Chart Containers
  // ----------------------------------------

  const statusChart = {
    NEW: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    REOPENED: 0,
    CLOSED: 0,
  };

  const priorityChart = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  const categoryChart = {};

  // ----------------------------------------
  // Prepare Chart Data
  // ----------------------------------------

  tickets.forEach((ticket) => {
    statusChart[ticket.status]++;

    priorityChart[ticket.priority]++;

    const categoryName =
      ticket.category?.name || "Unknown";

    categoryChart[categoryName] =
      (categoryChart[categoryName] || 0) + 1;
  });
    // ----------------------------------------
  // Convert Charts to Frontend Format
  // ----------------------------------------

  const statusChartData = Object.entries(
    statusChart
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const priorityChartData = Object.entries(
    priorityChart
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const categoryChartData = Object.entries(
    categoryChart
  )
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const slaChartData = [
    {
      name: "Met",
      value: sla.met,
    },
    {
      name: "Breached",
      value: sla.breached,
    },
  ];

  // ----------------------------------------
  // Prepare Report Table
  // ----------------------------------------

  const reportTable = tickets.map((ticket) => ({
  id: ticket.id,

  ticketId: ticket.ticketNumber,

  subject: ticket.title,

  employee:
    ticket.user_ticket_employeeIdTouser?.name || "-",

  department:
    ticket.user_ticket_employeeIdTouser?.department?.name || "-",

  organization:
    ticket.category?.organization?.name || "-",

  category:
    ticket.category?.name || "-",

  assignedTo:
    ticket.user_ticket_assignedToIdTouser?.name || "-",

  priority: ticket.priority,

  status: ticket.status,

  createdDate: ticket.createdAt,

  updatedDate: ticket.updatedAt,

  hoursSpent:
    formatMinutes(ticket.timeSpentMinutes),

  resolutionNotes:
    ticket.resolutionSummary || "-",

  firstResponseSLA:
    ticket.firstResponseTargetHours
      ? `${ticket.firstResponseTargetHours} hrs`
      : "-",

  resolutionSLA:
    ticket.resolutionTargetHours
      ? `${ticket.resolutionTargetHours} hrs`
      : "-",

  slaMet:
    ticket.resolvedAt &&
    ticket.resolutionDueAt
      ? ticket.resolvedAt <= ticket.resolutionDueAt
        ? "Yes"
        : "No"
      : "-",
}));

  // ----------------------------------------
  // Final Response
  // ----------------------------------------

  return {
    summary: {
      totalTickets,
      openTickets,
      closedTickets,
      slaCompliance: sla.percentage,
      slaBreached: sla.breached,
      averageResolutionTime:
        formatMinutes(
          averageResolutionMinutes
        ),
    },

    charts: {
      status: statusChartData,
      priority: priorityChartData,
      category: categoryChartData,
      sla: slaChartData,
    },

    tickets: reportTable,
  };
};

module.exports = {
  getReportData,
};