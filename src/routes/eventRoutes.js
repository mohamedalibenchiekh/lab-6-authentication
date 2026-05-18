// EVENT ROUTES

import express from 'express';
import { EventController } from '../controllers/eventController.js';

const router = express.Router();

// Event routes
router.get('/', EventController.getAllEvents);
router.get('/upcoming', EventController.getUpcomingEvents);
router.get('/location/:location', EventController.getEventsByLocation);
router.get('/:id', EventController.getEventById);
router.post('/', EventController.createEvent);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);
router.post('/:id/attend', EventController.addAttendee);
router.delete('/:id/attend', EventController.removeAttendee);

export default router;
