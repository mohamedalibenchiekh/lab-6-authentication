// AUTHENTICATION SERVICE
// Handles registration, login, token generation and verification

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";

export class AuthService {
  // Hash password with bcrypt
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare plain password with hashed password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(userId, email, role) {
    const token = jwt.sign(
      {
        id: userId,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );
    return token;
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
      );
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      throw new Error("Invalid token");
    }
  }

  // Register new user
  static async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "user", // Default role
      });

      // Generate token
      const token = this.generateToken(user._id, user.email, user.role);

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      return { user: userObject, token };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user with password field
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isPasswordMatch = await this.comparePassword(password, user.password);
      if (!isPasswordMatch) {
        throw new Error("Invalid email or password");
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id, user.email, user.role);

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      return { user: userObject, token };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get current user by ID
  static async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId)
        .populate("eventsAttended", "title date location")
        .populate("eventsOrganized", "title date location");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Change user password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select("+password");

      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const isPasswordMatch = await this.comparePassword(oldPassword, user.password);
      if (!isPasswordMatch) {
        throw new Error("Current password is incorrect");
      }

      // Hash and save new password
      const hashedPassword = await this.hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
}

export default AuthService;