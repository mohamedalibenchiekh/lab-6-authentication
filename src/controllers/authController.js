// AUTHENTICATION CONTROLLER
// Handles HTTP requests for authentication

import AuthService from "../services/authService.js";

// Helper for consistent API responses
class ApiResponse {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message, statusCode = 400) {
    return {
      success: false,
      message,
      statusCode,
    };
  }

  static created(data, message = "Resource created successfully") {
    return {
      success: true,
      message,
      data,
    };
  }
}

export class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json(
          ApiResponse.error("Name, email, and password are required", 400)
        );
      }

      // Validate password match
      if (password !== confirmPassword) {
        return res.status(400).json(
          ApiResponse.error("Passwords do not match", 400)
        );
      }

      // Validate password length
      if (password.length < 8) {
        return res.status(422).json(
          ApiResponse.error("Password must be at least 8 characters", 422)
        );
      }

      // Validate email format
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(422).json(
          ApiResponse.error("Please provide a valid email address", 422)
        );
      }

      const result = await AuthService.register({
        name,
        email,
        password,
      });

      res.status(201).json(
        ApiResponse.created(
          {
            user: result.user,
            token: result.token,
          },
          "User registered successfully"
        )
      );
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json(
          ApiResponse.error("Email and password are required", 400)
        );
      }

      const result = await AuthService.login(email, password);

      res.status(200).json(
        ApiResponse.success(
          {
            user: result.user,
            token: result.token,
          },
          "Login successful"
        )
      );
    } catch (error) {
      res.status(401).json(ApiResponse.error(error.message, 401));
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);

      res.status(200).json(
        ApiResponse.success(user, "Profile retrieved successfully")
      );
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json(
          ApiResponse.error("Old and new passwords are required", 400)
        );
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json(
          ApiResponse.error("New passwords do not match", 400)
        );
      }

      if (newPassword.length < 8) {
        return res.status(422).json(
          ApiResponse.error("Password must be at least 8 characters", 422)
        );
      }

      const result = await AuthService.changePassword(
        req.user.id,
        oldPassword,
        newPassword
      );

      res.status(200).json(
        ApiResponse.success(result, "Password changed successfully")
      );
    } catch (error) {
      res.status(400).json(ApiResponse.error(error.message, 400));
    }
  }

  // Logout (client-side token deletion)
  static async logout(req, res) {
    res.status(200).json(
      ApiResponse.success(null, "Logged out successfully")
    );
  }
}

export default AuthController;