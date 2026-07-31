const express = require("express");

const router = express.Router();

const ticketController = require("../controllers/ticket.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

// ==============================
// Get All Tickets
// ==============================
router.get(
  "/",
  authenticate,
  ticketController.getTickets
);

// ==============================
// Get My Tickets
// ==============================
router.get(
  "/my",
  authenticate,
  ticketController.getMyTickets
);

// ==============================
// Get My Ticket Statistics
// ==============================
router.get(
  "/my/stats",
  authenticate,
  ticketController.getMyTicketStats
);

// ==============================
// Get Admin Ticket Statistics
// ==============================
router.get(
  "/stats",
  authenticate,
  ticketController.getTicketStats
);

// ==============================
// Get Ticket Filter Options
// ==============================
router.get(
  "/filter-options",
  authenticate,
  ticketController.getTicketFilterOptions
);

// ==============================
// Get Ticket By ID
// ==============================
router.get(
  "/:id",
  authenticate,
  ticketController.getTicketById
);

// ==============================
// Create Ticket
// ==============================
router.post(
  "/",
  authenticate,
  upload.single("attachment"),
  ticketController.createTicket
);

// ==============================
// Add Comment
// ==============================
router.post(
  "/:id/comments",
  authenticate,
  ticketController.addComment
);

// ==============================
// Update Ticket
// ==============================
router.patch(
  "/:id",
  authenticate,
  ticketController.updateTicket
);

module.exports = router;