// USER SERVICE
// Database operations for users

import { User } from '../models/index.js';

export class UserService {
  // Create user
  static async createUser(data) {
    try {
      const user = new User(data);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const user = await User.findById(id)
        .populate('eventsAttended', 'title date location')
        .populate('eventsOrganized', 'title date location');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Get all users
  static async getAllUsers(page = 1, limit = 10) {
    try {
      const total = await User.countDocuments();
      const users = await User.find()
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Update user
  static async updateUser(id, data) {
    try {
      const user = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Get users by role
  static async getUsersByRole(role) {
    try {
      return await User.findByRole(role);
    } catch (error) {
      throw new Error(`Failed to fetch users by role: ${error.message}`);
    }
  }
}

export default UserService;
