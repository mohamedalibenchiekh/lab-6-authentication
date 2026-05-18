// AUTHENTICATION ROUTES
// Register, login, profile endpoints

import express from "express";
import AuthController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ===== PUBLIC ROUTES =====
// POST /api/v1/auth/register - Register new user
router.post("/register", AuthController.register);

// POST /api/v1/auth/login - Login user
router.post("/login", AuthController.login);

// ===== PROTECTED ROUTES (require authentication) =====
// GET /api/v1/auth/profile - Get current user profile
router.get("/profile", authenticate, AuthController.getProfile);

// POST /api/v1/auth/change-password - Change user password
router.post("/change-password", authenticate, AuthController.changePassword);

// POST /api/v1/auth/logout - Logout (client-side token deletion)
router.post("/logout", authenticate, AuthController.logout);

export default router;