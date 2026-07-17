const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const ticketService = require("../services/ticket.service");

const getTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getTickets();

    return successResponse(
      res,
      "Tickets fetched successfully",
      tickets
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(
      req.user.id
    );

    return successResponse(
      res,
      "My tickets fetched successfully",
      tickets
    );
  } catch (error) {
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
    return errorResponse(res, 404, error.message);
  }
};

const createTicket = async (req, res) => {
  try {
    const ticket =
      await ticketService.createTicket(
        req.body,
        req.user.id
      );

    return successResponse(
      res,
      "Ticket created successfully",
      ticket
    );
  } catch (error) {
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
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getTickets,
  getMyTickets,
  getTicketById,
  createTicket,
  updateTicket,
};