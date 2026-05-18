// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// Handles token verification and role-based access control

import AuthService from "../services/authService.js";

class ApiResponse {
  static error(message, statusCode = 400) {
    return {
      success: false,
      message,
      statusCode,
    };
  }
}

// Authenticate: Verify JWT token
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(
        ApiResponse.error(
          "No token provided. Use: Authorization: Bearer <token>",
          401
        )
      );
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Attach user info to request object
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json(ApiResponse.error(error.message || "Invalid or expired token", 401));
  }
};

// Authorize: Check if user has required role(s)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.error("Not authenticated", 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          403
        )
      );
    }

    next();
  };
};

// Optional authentication: Attach user if token provided, but don't require it
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      req.user = decoded;
      req.userId = decoded.id;
    }

    next();
  } catch (error) {
    // Token invalid but optional, continue without user
    next();
  }
};

// Check if user owns a resource or is admin
export const isOwner = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponse.error("Not authenticated", 401)
        );
      }

      // Admin can access everything
      if (req.user.role === "admin") {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.id !== resourceUserId.toString()) {
        return res.status(403).json(
          ApiResponse.error("You don't have permission to access this resource", 403)
        );
      }

      next();
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message, 500));
    }
  };
};

export default {
  authenticate,
  authorize,
  optionalAuth,
  isOwner,
};