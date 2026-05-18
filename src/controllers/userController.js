// USER CONTROLLER WITH DATABASE

import UserService from '../services/userService.js';
import ApiResponse from '../utils/apiResponse.js';
import ValidationService from '../utils/validationService.js';

export class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await UserService.getAllUsers(page, limit);

      res
        .status(200)
        .json(ApiResponse.paginated(result.users, result.page, result.limit, result.total));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid user ID format', 400));
      }

      const user = await UserService.getUserById(id);
      res.status(200).json(ApiResponse.success(user, 'User retrieved successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Create user
  static async createUser(req, res) {
    try {
      const { name, email, role } = req.body;

      const validation = ValidationService.validateUser({ name, email });

      if (!validation.isValid) {
        return res.status(422).json(ApiResponse.validationError(validation.errors));
      }

      const user = await UserService.createUser({ name, email, role });
      res.status(201).json(ApiResponse.success(user, 'User created successfully', 201));
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid user ID format', 400));
      }

      const user = await UserService.updateUser(id, { name, email, role });
      res.status(200).json(ApiResponse.success(user, 'User updated successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationService.validateId(id)) {
        return res.status(400).json(ApiResponse.error('Invalid user ID format', 400));
      }

      await UserService.deleteUser(id);
      res.status(200).json(ApiResponse.success(null, 'User deleted successfully'));
    } catch (error) {
      res.status(404).json(ApiResponse.error(error.message, 404));
    }
  }

  // Get user by email
  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return res.status(404).json(ApiResponse.error('User not found', 404));
      }

      res.status(200).json(ApiResponse.success(user, 'User retrieved successfully'));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }

  // Get users by role
  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await UserService.getUsersByRole(role);
      res.status(200).json(ApiResponse.success(users, `Users with role: ${role}`));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  }
}

export default UserController;
