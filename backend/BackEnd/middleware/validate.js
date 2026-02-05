import Joi from 'joi';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validation middleware factory
 * Validates request data against Joi schema
 * @param {Object} schema - Joi validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first
      allowUnknown: true, // Allow unknown keys (for params like userId)
      stripUnknown: true, // Remove unknown keys
    };

    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      validationOptions
    );

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Validation Error',
        errorMessages
      );
    }

    // Don't modify req.query or req.params as they may be read-only
    // Only update req.body with validated data
    if (value.body !== undefined) {
      req.body = value.body;
    }
    
    next();
  };
};

export default validate;
