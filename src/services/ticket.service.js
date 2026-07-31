const prisma = require("../config/prisma");

const VALIDATION = require("../constants/validation");

const { getPagination } = require("../utils/pagination");

const getTickets = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  const {
    skip,
    limit: take,
    page: currentPage,
  } = getPagination(page, limit);

  const {
    search,
    organization,
    status,
    priority,
    category,
    department,
    assignedTo,
  } = filters;

  const where = {};

  // ----------------------------
  // Search
  // ----------------------------
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

  // ----------------------------
  // Organization
  // ----------------------------
  if (
    organization &&
    organization !== "All Organizations"
  ) {
    where.Category = {
      Organization: {
        name: organization,
      },
    };
  }

  // ----------------------------
  // Status
  // ----------------------------
  if (
    status &&
    status !== "All Status"
  ) {
    where.status = status;
  }

  // ----------------------------
  // Priority
  // ----------------------------
  if (
    priority &&
    priority !== "All Priority"
  ) {
    where.priority = priority;
  }

  // ----------------------------
  // Category
  // ----------------------------
  if (
    category &&
    category !== "All Categories"
  ) {
    where.Category = {
      ...(where.Category || {}),
      name: category,
    };
  }

  // ----------------------------
  // Department
  // ----------------------------
  if (
    department &&
    department !== "All Departments"
  ) {
    where.User_Ticket_employeeIdToUser = {
      Department: {
        name: department,
      },
    };
  }

  // ----------------------------
  // Assigned To
  // ----------------------------
  if (
    assignedTo &&
    assignedTo !== "All IT Support"
  ) {
    where.User_Ticket_assignedToIdToUser = {
      name: assignedTo,
    };
  }

  const [tickets, totalItems] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take,

      include: {
        User_Ticket_employeeIdToUser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
            status: true,

            Department: {
              select: {
                id: true,
                name: true,

                Organization: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },

        User_Ticket_assignedToIdToUser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },

        Category: {
          include: {
            Organization: true,
          },
        },

        TicketHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.ticket.count({
      where,
    }),
  ]);

  return {
    items: tickets,

    pagination: {
      page: currentPage,
      limit: take,
      totalItems,
      totalPages: Math.ceil(
        totalItems / take
      ),
      hasNextPage:
        currentPage <
        Math.ceil(totalItems / take),
      hasPreviousPage:
        currentPage > 1,
    },
  };
};
const getTicketStats = async () => {
  const [
    totalTickets,
    newTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  ] = await Promise.all([
    prisma.ticket.count(),

    prisma.ticket.count({
      where: {
        status: "NEW",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "ASSIGNED",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "RESOLVED",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "CLOSED",
      },
    }),
  ]);

  return {
    totalTickets,
    openTickets: newTickets + assignedTickets,
    waitingTickets: inProgressTickets,
    resolvedTickets,
    closedTickets,
  };
};
const getMyTicketStats = async (employeeId) => {
  const [
    totalTickets,
    newTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        employeeId,
      },
    }),

    prisma.ticket.count({
      where: {
        employeeId,
        status: "NEW",
      },
    }),

    prisma.ticket.count({
      where: {
        employeeId,
        status: "ASSIGNED",
      },
    }),

    prisma.ticket.count({
      where: {
        employeeId,
        status: "IN_PROGRESS",
      },
    }),

    prisma.ticket.count({
      where: {
        employeeId,
        status: "RESOLVED",
      },
    }),

    prisma.ticket.count({
      where: {
        employeeId,
        status: "CLOSED",
      },
    }),
  ]);

  return {
    totalTickets,
    openTickets: newTickets + assignedTickets,
    waitingTickets: inProgressTickets,
    resolvedTickets,
    closedTickets,
  };
};
const getTicketFilterOptions = async () => {
  const [
    organizations,
    categories,
    departments,
    assignedUsers,
  ] = await Promise.all([
    prisma.organization.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    }),

    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    }),

    prisma.department.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    }),

    prisma.user.findMany({
      where: {
        role: "IT_SUPPORT",
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    }),
  ]);

  return {
    organizations: organizations.map((o) => o.name),

    statuses: [
      "NEW",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ],

    priorities: [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ],

    categories: categories.map((c) => c.name),

    departments: departments.map((d) => d.name),

    assignedUsers: assignedUsers.map((u) => u.name),
  };
};
const getMyTickets = async (
  employeeId,
  page = 1,
  limit = 10,
  search = ""
) => {
  const {
    skip,
    limit: take,
    page: currentPage,
  } = getPagination(page, limit);

  const where = {
    employeeId,
  };

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

  const [tickets, totalItems] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take,

      include: {
        Category: {
          include: {
            Organization: true,
          },
        },

        User_Ticket_assignedToIdToUser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },

        TicketHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.ticket.count({
      where,
    }),
  ]);

  return {
    items: tickets,

    pagination: {
      page: currentPage,
      limit: take,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
      hasNextPage:
        currentPage <
        Math.ceil(totalItems / take),
      hasPreviousPage: currentPage > 1,
    },
  };
};