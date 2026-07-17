const prisma = require("../config/prisma");

const getTickets = async () => {
  return await prisma.ticket.findMany({
    include: {
      employee: true,
      assignedTo: true,
      category: {
        include: {
          organization: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMyTickets = async (employeeId) => {
  return await prisma.ticket.findMany({
    where: {
      employeeId,
    },
    include: {
      category: {
        include: {
          organization: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTicketById = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      employee: {
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
      assignedTo: {
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
      history: {
        include: {
          updatedBy: {
  select: {
    id: true,
    employeeId: true,
    name: true,
    role: true,
  },
},
        },
        orderBy: {
          createdAt: "desc",
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

  const ticketCount = await prisma.ticket.count();

  const ticketNumber =
    "TF-" + String(ticketCount + 1).padStart(5, "0");

  return await prisma.ticket.create({
    data: {
      ticketNumber,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      employeeId,
      priority: data.priority,
      attachment: data.attachment || null,
    },
  });
};

const updateTicket = async (ticketId, data, updatedById) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      assignedToId: data.assignedToId,
      priority: data.priority,
      status: data.status,
    },
  });

  if (ticket.status !== data.status) {
    await prisma.ticketHistory.create({
      data: {
        ticketId,
        updatedById,
        oldStatus: ticket.status,
        newStatus: data.status,
        remarks: data.remarks || "",
      },
    });
  }

  return updatedTicket;
};



module.exports = {
  getTickets,
  getMyTickets,
  getTicketById,
  createTicket,
  updateTicket,
};