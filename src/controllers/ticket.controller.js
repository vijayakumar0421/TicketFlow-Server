const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const ticketService = require("../services/ticket.service");

const getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      organization,
      status,
      priority,
      category,
      department,
      assignedTo,
    } = req.query;

    const tickets = await ticketService.getTickets(
      page,
      limit,
      {
        search,
        organization,
        status,
        priority,
        category,
        department,
        assignedTo,
      }
    );

    return successResponse(
      res,
      "Tickets fetched successfully",
      tickets
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

const getTicketStats = async (req, res) => {
  try {
    const stats =
      await ticketService.getTicketStats();

    return successResponse(
      res,
      "Ticket statistics fetched successfully",
      stats
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

const getMyTicketStats = async (req, res) => {
  try {
    const stats =
      await ticketService.getMyTicketStats(
        req.user.id
      );

    return successResponse(
      res,
      "My ticket statistics fetched successfully",
      stats
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

const getTicketFilterOptions = async (
  req,
  res
) => {
  try {
    const options =
      await ticketService.getTicketFilterOptions();

    return successResponse(
      res,
      "Ticket filter options fetched successfully",
      options
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

const getMyTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const tickets =
      await ticketService.getMyTickets(
        req.user.id,
        page,
        limit,
        search
      );

    return successResponse(
      res,
      "My tickets fetched successfully",
      tickets
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      500,
      error.message
    );
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(
      Number(req.params.id)
    );

    return successResponse(
      res,
      "Ticket fetched successfully",
      ticket
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 404, error.message);
  }
};

const createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      attachment: req.file
        ? `/uploads/${req.file.filename}`
        : null,
    };

    const ticket =
      await ticketService.createTicket(
        ticketData,
        req.user.id
      );

    return successResponse(
      res,
      "Ticket created successfully",
      ticket
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket =
      await ticketService.updateTicket(
        Number(req.params.id),
        req.body,
        req.user.id
      );

    return successResponse(
      res,
      "Ticket updated successfully",
      ticket
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};


const addComment = async (req, res) => {
  try {
    const comment = await ticketService.addComment(
      Number(req.params.id),
      req.user.id,
      req.body.comment
    );

    return successResponse(
      res,
      "Comment added successfully",
      comment
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
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