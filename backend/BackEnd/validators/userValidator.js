import Joi from 'joi';
import { USER_ROLES, USER_STATUS } from '../config/constants.js';

/**
 * User validation schemas
 * Following Single Responsibility Principle
 */

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .default(USER_ROLES.STAFF),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
    department: Joi.string().max(100),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),
});

export const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .default(USER_ROLES.STAFF),
    warehouse: Joi.string().when('role', {
      is: USER_ROLES.ADMIN,
      then: Joi.optional(),
      otherwise: Joi.required().messages({
        'any.required': 'Warehouse is required for non-admin users',
      }),
    }),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
    department: Joi.string().max(100),
    status: Joi.string().valid(...Object.values(USER_STATUS)).default(USER_STATUS.ACTIVE),
  }),
});

export const updateUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    role: Joi.string().valid(...Object.values(USER_ROLES)),
    status: Joi.string().valid(...Object.values(USER_STATUS)),
    warehouse: Joi.string(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
    department: Joi.string().max(100),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters',
    }),
  }),
});

export const getUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deleteUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});
