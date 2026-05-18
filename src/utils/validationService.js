// VALIDATION SERVICE
// Input validation utilities

class ValidationService {
  static validateId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
  }

  static validateEvent(data) {
    const errors = [];

    if (!data.title || data.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (!data.date) {
      errors.push('Date is required');
    } else if (new Date(data.date) <= new Date()) {
      errors.push('Date must be in the future');
    }

    if (!data.location || data.location.length < 2) {
      errors.push('Location must be at least 2 characters');
    }

    if (!data.capacity || data.capacity < 1) {
      errors.push('Capacity must be at least 1');
    } else if (data.capacity > 10000) {
      errors.push('Capacity cannot exceed 10000');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUser(data) {
    const errors = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!data.email) {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.push('Please provide a valid email address');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ValidationService;
