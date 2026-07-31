const prisma = require("../config/prisma");
const VALIDATION = require("../constants/validation");
const { getPagination } = require("../utils/pagination");

/**
 * Get All Tickets
 */
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

  // Search
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

  // Organization
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

  // Status
  if (
    status &&
    status !== "All Status"
  ) {
    where.status = status;
  }

  // Priority
  if (
    priority &&
    priority !== "All Priority"
  ) {
    where.priority = priority;
  }

  // Category
  if (
    category &&
    category !== "All Categories"
  ) {
    where.Category = {
      ...(where.Category || {}),
      name: category,
    };
  }

  // Department
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

  // Assigned To
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
              include: {
                Organization: true,
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
          include: {
            User: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                role: true,
              },
            },
          },
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

/**
 * Dashboard Statistics
 */
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
    openTickets:
      newTickets +
      assignedTickets +
      inProgressTickets,
    newTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  };
};

/**
 * Employee Dashboard Statistics
 */
const getMyTicketStats = async (
  employeeId
) => {
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
    openTickets:
      newTickets +
      assignedTickets +
      inProgressTickets,
    newTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  };
};

/**
 * Ticket Filter Options
 */
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
    organizations: organizations.map(
      (o) => o.name
    ),

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

    categories: categories.map(
      (c) => c.name
    ),

    departments: departments.map(
      (d) => d.name
    ),

    assignedUsers: assignedUsers.map(
      (u) => u.name
    ),
  };
};

/**
 * Employee Tickets
 */
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

  const [tickets, totalItems] =
    await Promise.all([
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
            include: {
              User: {
                select: {
                  id: true,
                  employeeId: true,
                  name: true,
                  role: true,
                },
              },
            },

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

/**
 * Get Single Ticket
 */
const getTicketById = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },

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
            include: {
              Organization: true,
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

      // ✅ Resolved By
      ResolvedBy: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
        },
      },

      Category: {
        include: {
          Organization: true,
        },
      },

      TicketHistory: {
        include: {
          User: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      Comments: {
        include: {
          User: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  return ticket;
};

/**
 * Create Ticket
 */
const createTicket = async (
  data,
  employeeId
) => {
  const category =
    await prisma.category.findUnique({
      where: {
        id: Number(data.categoryId),
      },
    });

  if (!category) {
    throw new Error("Category not found.");
  }

  const title = data.title?.trim() || "";
  const description =
    data.description?.trim() || "";

  if (
    title.length >
    VALIDATION.TICKET.TITLE_MAX_LENGTH
  ) {
    throw new Error(
      `Title cannot exceed ${VALIDATION.TICKET.TITLE_MAX_LENGTH} characters.`
    );
  }

  if (
    description.length >
    VALIDATION.TICKET.DESCRIPTION_MAX_LENGTH
  ) {
    throw new Error(
      `Description cannot exceed ${VALIDATION.TICKET.DESCRIPTION_MAX_LENGTH} characters.`
    );
  }

  const ticketCount =
    await prisma.ticket.count();

  const ticketNumber =
    "TF-" +
    String(ticketCount + 1).padStart(
      5,
      "0"
    );

  // ==========================
  // SLA Calculation
  // ==========================
  const firstResponseTargetHours = 2;
  const resolutionTargetHours = 24;

  const createdAt = new Date();

  const firstResponseDueAt =
    new Date(createdAt);

  firstResponseDueAt.setHours(
    firstResponseDueAt.getHours() +
      firstResponseTargetHours
  );

  const resolutionDueAt =
    new Date(createdAt);

  resolutionDueAt.setHours(
    resolutionDueAt.getHours() +
      resolutionTargetHours
  );
  // ==========================

  const ticket =
    await prisma.ticket.create({
      data: {
        ticketNumber,

        title,

        description,

        categoryId: Number(
          data.categoryId
        ),

        employeeId,

        priority:
          data.priority || "MEDIUM",

        status: "NEW",

        attachment:
          data.attachment || null,

        // ==========================
        // SLA
        // ==========================
        firstResponseTargetHours,
        resolutionTargetHours,
        firstResponseDueAt,
        resolutionDueAt,
        createdAt,
        updatedAt: createdAt,
        // ==========================
      },

      include: {
        Category: {
          include: {
            Organization: true,
          },
        },

        User_Ticket_employeeIdToUser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
          },
        },
      },
    });

  await prisma.ticketHistory.create({
    data: {
      ticketId: ticket.id,

      updatedById: employeeId,

      oldStatus: "NEW",

      newStatus: "NEW",

      remarks: "Ticket Created",
    },
  });

  return ticket;
};
/**
 * Validate Ticket Status Transition
 */
const validateStatusTransition = (
  currentStatus,
  newStatus
) => {
  const allowedTransitions = {
    NEW: [
      "ASSIGNED",
    ],

    ASSIGNED: [
      "IN_PROGRESS",
      "RESOLVED",
    ],

    IN_PROGRESS: [
      "RESOLVED",
    ],

    RESOLVED: [
      "CLOSED",
      "REOPENED",
    ],

    REOPENED: [
      "IN_PROGRESS",
    ],

    CLOSED: [
      "REOPENED",
    ],
  };

  if (currentStatus === newStatus) {
    return;
  }

  const allowed =
    allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}.`
    );
  }
};

/**
 * Update Ticket
 */
const updateTicket = async (
  ticketId,
  data,
  updatedById
) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  validateStatusTransition(
    ticket.status,
    data.status
  );

  // ==========================
  // SLA + Resolution Updates
  // ==========================
  const updateData = {
    assignedToId: data.assignedToId || null,
    priority: data.priority,
    status: data.status,
    updatedAt: new Date(),
  };

  // Record First Response only once
  if (
    !ticket.firstResponseAt &&
    (
      data.status === "ASSIGNED" ||
      data.status === "IN_PROGRESS"
    )
  ) {
    updateData.firstResponseAt = new Date();
  }

  // Ticket Resolved
  if (
    data.status === "RESOLVED" &&
    !ticket.resolvedAt
  ) {
    updateData.resolvedAt = new Date();

    updateData.resolvedById = updatedById;

    updateData.resolutionSummary =
      data.resolutionSummary || null;

    updateData.resolutionHours =
      data.hours ?? null;

    updateData.resolutionMinutes =
      data.minutes ?? null;
  }

  // Future support for Reopened
  if (data.status === "REOPENED") {
    updateData.resolvedAt = null;
    updateData.resolvedById = null;
    updateData.resolutionSummary = null;
    updateData.resolutionHours = null;
    updateData.resolutionMinutes = null;
  }

  // ==========================

  const updatedTicket =
    await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: updateData,
    });

  if (ticket.status !== data.status) {
    await prisma.ticketHistory.create({
      data: {
        ticketId,
        updatedById,
        oldStatus: ticket.status,
        newStatus: data.status,
        remarks: data.remarks || null,
      },
    });
  }

  return updatedTicket;
};

const addComment = async (
  ticketId,
  userId,
  comment
) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const newComment =
    await prisma.ticketComment.create({
      data: {
        ticketId,
        commentedBy: userId,
        comment,
      },

      include: {
        User: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
          },
        },
      },
    });

  return newComment;
};

module.exports = {
  getTickets,
  getTicketStats,
  getMyTicketStats,
  getTicketFilterOptions,
  getMyTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
};