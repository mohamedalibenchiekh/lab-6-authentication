// EVENT ROUTES
// Handles event-related API endpoints

import express from "express";
import EventController from "../controllers/eventController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// ===== PUBLIC ROUTES (no authentication required) =====
// GET /api/v1/events - Get all events
router.get("/", EventController.getAllEvents);

// GET /api/v1/events/:id - Get event by ID
router.get("/:id", EventController.getEventById);

// ===== PROTECTED ROUTES (authentication required) =====
// All routes below require authentication

// POST /api/v1/events - Create event (organizers and admins only)
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  EventController.createEvent
);

// PUT /api/v1/events/:id - Update event (owner or admin)
router.put("/:id", authenticate, EventController.updateEvent);

// DELETE /api/v1/events/:id - Delete event (owner or admin)
router.delete("/:id", authenticate, EventController.deleteEvent);

// POST /api/v1/events/:id/register - Register for event (any authenticated user)
router.post("/:id/register", authenticate, EventController.registerForEvent);

// DELETE /api/v1/events/:id/cancel - Cancel registration
router.delete("/:id/cancel", authenticate, EventController.cancelRegistration);

export default router;