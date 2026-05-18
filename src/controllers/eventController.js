// EVENT CONTROLLER WITH DATABASE

import EventService from '../services/eventService.js';
import ApiResponse from '../utils/apiResponse.js';
import ValidationService from '../utils/validationService.js';

export class EventController {
  // Get all events
  static async getAllEvents(req, res) {
    try {
      const { status, location, search, minCapacity, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (location) filters.location = location;
      if (search) filters.search = search;
      if (minCapacity) filters.minCapacity = minCapacity;

      const result = await EventService.getAllEvents(filters, page, limit);

      res
        .status(200)
        .json(ApiResponse.paginated(result.events, result.page, result.limit, result.total));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Get single event
  static async getEventById(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid event ID format', 400));
      }

      const event = await EventService.getEventById(id);
      res.status(200).json(ApiResponse.success(event, 'Event retrieved successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Create event
  static async createEvent(req, res) {
    try {
      const { title, date, location, capacity, description } = req.body;

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

      // TODO: In LAB 6, this will come from authenticated user
      // For now, create a sample organizer or use a test ID
      const organizerId = '507f1f77bcf86cd799439011'; // Placeholder

      const event = await EventService.createEvent(
        { title, date, location, capacity, description },
        organizerId
      );

      res.status(201).json(ApiResponse.success(event, 'Event created successfully', 201));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Update event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const { title, date, location, capacity, description, status } = req.body;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid event ID format', 400));
      }

      const event = await EventService.updateEvent(id, {
        title,
        date,
        location,
        capacity,
        description,
        status,
      });

      res.status(200).json(ApiResponse.success(event, 'Event updated successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Delete event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid event ID format', 400));
      }

      await EventService.deleteEvent(id);
      res.status(200).json(ApiResponse.success(null, 'Event deleted successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Add attendee to event
  static async addAttendee(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!ValidationService.validateId(id) || !ValidationService.validateId(userId)) {
        return res.status(400).json(ApiResponse.error('Invalid ID format', 400));
      }

      const event = await EventService.addAttendee(id, userId);
      res.status(200).json(ApiResponse.success(event, 'Attendee added successfully'));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Remove attendee from event
  static async removeAttendee(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!ValidationService.validateId(id) || !ValidationService.validateId(userId)) {
        return res.status(400).json(ApiResponse.error('Invalid ID format', 400));
      }

      const event = await EventService.removeAttendee(id, userId);
      res.status(200).json(ApiResponse.success(event, 'Attendee removed successfully'));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(req, res) {
    try {
      const { limit = 5 } = req.query;
      const events = await EventService.getUpcomingEvents(parseInt(limit));
      res.status(200).json(ApiResponse.success(events, 'Upcoming events retrieved'));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Get events by location
  static async getEventsByLocation(req, res) {
    try {
      const { location } = req.params;
      const events = await EventService.getEventsByLocation(location);
      res.status(200).json(ApiResponse.success(events, `Events in ${location}`));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }
}

export default EventController;
