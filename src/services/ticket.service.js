const prisma = require("../config/prisma");

const VALIDATION = require("../constants/validation");

const {
  getPagination,
} = require("../utils/pagination");

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
    where.category = {
      organization: {
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
    where.category = {
      ...(where.category || {}),
      name: category,
    };
  }

  // Department
  if (
    department &&
    department !== "All Departments"
  ) {
    where.user_ticket_employeeIdTouser = {
      department: {
        name: department,
      },
    };
  }

  // Assigned To
  if (
    assignedTo &&
    assignedTo !== "All IT Support"
  ) {
    where.user_ticket_assignedToIdTouser = {
      name: assignedTo,
    };
  }

  const [tickets, totalItems] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take,

      include: {
        user_ticket_employeeIdTouser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
            status: true,
            department: {
              select: {
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
            role: true,
            status: true,
          },
        },

        category: {
          include: {
            organization: true,
          },
        },

        attachments: true,
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
    resolvedTickets: resolvedTickets,
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
  organizations: organizations.map(
    (o) => o.name
  ),

  statuses: [
    "NEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "REOPENED",
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
        category: {
          include: {
            organization: true,
          },
        },
        user_ticket_assignedToIdTouser: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
          },
        },

         attachments: true,
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
        currentPage < Math.ceil(totalItems / take),
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getTicketById = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user_ticket_employeeIdTouser: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          department: {
            select: {
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
          role: true,
          status: true,
        },
      },

      category: {
        include: {
          organization: true,
        },
      },

      tickethistory: {
        include: {
          user: {
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

        comments: {
        include: {
          user: {
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

      attachments: {
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

const createTicket = async (data, employeeId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  const title = data.title?.trim() || "";
  const description = data.description?.trim() || "";

  if (title.length > VALIDATION.TICKET.TITLE_MAX_LENGTH) {
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

  const ticketCount = await prisma.ticket.count();

  const ticketNumber =
    "TF-" + String(ticketCount + 1).padStart(5, "0");

  // --------------------------------
  // Get Active SLA Policy
  // --------------------------------
  const slaPolicy = await prisma.slapolicy.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!slaPolicy) {
    throw new Error("No active SLA Policy found.");
  }

  const now = new Date();

  const firstResponseDueAt = new Date(
    now.getTime() + slaPolicy.firstResponseHours * 60 * 60 * 1000
  );

  const resolutionDueAt = new Date(
    now.getTime() + slaPolicy.resolutionHours * 60 * 60 * 1000
  );

  return await prisma.ticket.create({
    data: {
      ticketNumber,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      employeeId,
      priority: data.priority,

      firstResponseTargetHours:
        slaPolicy.firstResponseHours,

      resolutionTargetHours:
        slaPolicy.resolutionHours,

      firstResponseDueAt,
      resolutionDueAt,

      attachments: data.attachments?.length
        ? {
            create: data.attachments.map((file) => ({
              fileName: file.fileName,
              fileType: file.fileType,
              fileData: file.fileData,
            })),
          }
        : undefined,
    },

    include: {
      attachments: true,
    },
  });
};

const validateStatusTransition = (
  currentStatus,
  newStatus
) => {
  const allowedTransitions = {
    NEW: ["ASSIGNED"],

    ASSIGNED: ["IN_PROGRESS"],

    IN_PROGRESS: ["RESOLVED"],

    RESOLVED: ["CLOSED", "REOPENED"],

    CLOSED: ["REOPENED"],

    REOPENED: ["IN_PROGRESS"],
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

const updateTicket = async (ticketId, data, updatedById) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }



    validateStatusTransition(ticket.status, data.status);

    const hours = Number(data.hours || 0);
    const minutes = Number(data.minutes || 0);

    const resolutionTimeMinutes =
      (hours * 60) + minutes;

        if (data.status === "RESOLVED") {
          if (!data.resolutionSummary?.trim()) {
            throw new Error(
              "Resolution summary is required."
            );
          }

          if (resolutionTimeMinutes <= 0) {
            throw new Error(
              "Resolution time is required."
            );
          }
        }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: data.assignedToId || null,
        priority: data.priority,
        status: data.status,

        resolutionSummary:
          data.status === "RESOLVED"
            ? data.resolutionSummary
            : ticket.resolutionSummary,

        timeSpentMinutes:
          data.status === "RESOLVED"
            ? resolutionTimeMinutes
            : ticket.timeSpentMinutes,

        firstResponseAt:
        data.status === "ASSIGNED" &&
        !ticket.firstResponseAt
          ? new Date()
          : ticket.firstResponseAt,

      resolvedAt:
        (data.status === "RESOLVED" ||
          data.status === "CLOSED") &&
        !ticket.resolvedAt
          ? new Date()
          : ticket.resolvedAt,
      },
    });

      // Status History
      if (ticket.status !== data.status) {
        await prisma.tickethistory.create({
          data: {
            ticketId,
            updatedById,
            oldStatus: ticket.status,
            newStatus: data.status,
          },
        });
      }

    return updatedTicket;
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    throw error;
  }
};

const addComment = async (ticketId, userId, comment) => {
  if (!comment || !comment.trim()) {
    throw new Error("Comment is required.");
  }

  if (comment.trim().length > 2000) {
    throw new Error("Comment cannot exceed 2000 characters.");
  }

  // Ensure ticket exists
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  // Get current user
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  // Save comment
  const newComment = await prisma.ticketcomment.create({
    data: {
      ticketId,
      userId,
      comment: comment.trim(),
    },
    include: {
      user: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          role: true,
        },
      },
    },
  });

  // Mark First Response SLA only once
  if (
    ticket.firstResponseAt === null &&
    (user.role === "ADMIN" || user.role === "IT_SUPPORT")
  ) {
    await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        firstResponseAt: new Date(),
      },
    });
  }

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