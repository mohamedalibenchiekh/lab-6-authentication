// EVENT CONTROLLER
// Handles HTTP requests for event management

import EventService from "../services/eventService.js";

class ApiResponse {
  static success(data, message = "Success") {
    return { success: true, message, data };
  }
  static error(message, statusCode = 400) {
    return { success: false, message, statusCode };
  }
  static created(data, message = "Resource created successfully") {
    return { success: true, message, data };
  }
  static validationError(errors) {
    return { success: false, message: "Validation failed", errors };
  }
}

class ValidationService {
  static validateEvent(data) {
    const errors = [];
    if (!data.title || data.title.length < 3) {
      errors.push("Title must be at least 3 characters");
    }
    if (!data.date) {
      errors.push("Date is required");
    }
    if (!data.location) {
      errors.push("Location is required");
    }
    if (data.capacity && (data.capacity < 1 || data.capacity > 10000)) {
      errors.push("Capacity must be between 1 and 10000");
    }
    return { isValid: errors.length === 0, errors };
  }
}

export class EventController {
  // Get all events (public)
  static async getAllEvents(req, res) {
    try {
      const events = await EventService.getAllEvents();
      res.status(200).json(ApiResponse.success(events, "Events retrieved successfully"));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Get event by ID (public)
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);
      res.status(200).json(ApiResponse.success(event, "Event retrieved successfully"));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Create event (requires authentication + organizer role)
  static async createEvent(req, res) {
    try {
      const { title, date, location, capacity, description } = req.body;
      
      // Use authenticated user as organizer
      const organizerId = req.user.id;

      const validation = ValidationService.validateEvent({
        title,
        date,
        location,
        capacity,
        description,
      });

      if (!validation.isValid) {
        return res.status(422).json(ApiResponse.validationError(validation.errors));
      }

      const event = await EventService.createEvent(
        {
          title,
          date,
          location,
          capacity,
          description,
        },
        organizerId
      );

      res.status(201).json(ApiResponse.created(event, "Event created successfully"));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Update event (only organizer or admin)
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get event to check ownership
      const event = await EventService.getEventById(id);

      // Check if user is organizer or admin
      const isOrganizer = event.organizer && event.organizer._id.toString() === userId;
      const isAdmin = userRole === "admin";

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json(
          ApiResponse.error("Only the event organizer or admin can update this event", 403)
        );
      }

      const updatedEvent = await EventService.updateEvent(id, req.body);
      res.status(200).json(ApiResponse.success(updatedEvent, "Event updated successfully"));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Delete event (only organizer or admin)
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get event to check ownership
      const event = await EventService.getEventById(id);

      // Check if user is organizer or admin
      const isOrganizer = event.organizer && event.organizer._id.toString() === userId;
      const isAdmin = userRole === "admin";

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json(
          ApiResponse.error("Only the event organizer or admin can delete this event", 403)
        );
      }

      await EventService.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Register for event (authenticated users)
  static async registerForEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const event = await EventService.registerUserForEvent(id, userId);
      res.status(200).json(ApiResponse.success(event, "Successfully registered for event"));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Cancel event registration
  static async cancelRegistration(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const event = await EventService.cancelRegistration(id, userId);
      res.status(200).json(ApiResponse.success(event, "Successfully cancelled registration"));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }
}

export default EventController;