// USER ROUTES

import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/', UserController.getAllUsers);
router.get('/email/:email', UserController.getUserByEmail);
router.get('/role/:role', UserController.getUsersByRole);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
