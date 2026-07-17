const express = require("express");

const router = express.Router();

const ticketController = require("../controllers/ticket.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get(
  "/",
  authenticate,
  ticketController.getTickets
);

router.get(
  "/my",
  authenticate,
  ticketController.getMyTickets
);

router.get(
  "/:id",
  authenticate,
  ticketController.getTicketById
);

router.post(
  "/",
  authenticate,
  ticketController.createTicket
);

router.patch(
  "/:id",
  authenticate,
  ticketController.updateTicket
);

module.exports = router;