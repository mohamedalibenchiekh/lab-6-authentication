// EVENT SERVICE
// Database operations using Mongoose

import { Event, User } from '../models/index.js';

export class EventService {
  // Create new event
  static async createEvent(data, organizerId) {
    try {
      const event = new Event({
        ...data,
        organizer: organizerId,
      });

      await event.save();

      // Add event to user's organized events
      const user = await User.findById(organizerId);
      if (user) {
        await user.organizeEvent(event._id);
      }

      return await event.populate('organizer', 'name email');
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  // Get all events with filtering
  static async getAllEvents(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters.minCapacity) {
        query.capacity = { $gte: parseInt(filters.minCapacity) };
      }

      const total = await Event.countDocuments(query);
      const events = await Event.find(query)
        .populate('organizer', 'name email')
        .populate('attendeeList', 'name email')
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        events,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  // Get event by ID
  static async getEventById(id) {
    try {
      const event = await Event.findById(id)
        .populate('organizer', 'name email')
        .populate('attendeeList', 'name email');

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  // Update event
  static async updateEvent(id, data) {
    try {
      const event = await Event.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate('organizer', 'name email')
        .populate('attendeeList', 'name email');

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  // Delete event
  static async deleteEvent(id) {
    try {
      const event = await Event.findByIdAndDelete(id);

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  // Add attendee
  static async addAttendee(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');

      await event.addAttendee(userId);

      const user = await User.findById(userId);
      if (user) {
        await user.attendEvent(eventId);
      }

      return await event.populate(['organizer', 'attendeeList']);
    } catch (error) {
      throw new Error(`Failed to add attendee: ${error.message}`);
    }
  }

  // Remove attendee
  static async removeAttendee(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');

      await event.removeAttendee(userId);

      return await event.populate(['organizer', 'attendeeList']);
    } catch (error) {
      throw new Error(`Failed to remove attendee: ${error.message}`);
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(limit = 5) {
    try {
      return await Event.findUpcoming().populate('organizer', 'name email').limit(limit);
    } catch (error) {
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }
  }

  // Get events by location
  static async getEventsByLocation(location) {
    try {
      return await Event.findByLocation(location).populate('organizer', 'name email');
    } catch (error) {
      throw new Error(`Failed to fetch events by location: ${error.message}`);
    }
  }
}

export default EventService;
