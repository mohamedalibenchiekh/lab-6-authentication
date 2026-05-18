// API RESPONSE UTILITY
// Standardized API responses

class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      statusCode,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message, statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      statusCode,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      message: 'Success',
      statusCode: 200,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(errors) {
    return {
      success: false,
      message: 'Validation Error',
      statusCode: 422,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}

export default ApiResponse;
