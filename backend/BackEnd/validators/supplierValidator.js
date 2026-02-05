import Joi from 'joi';
import { SUPPLIER_STATUS } from '../config/constants.js';

/**
 * Supplier validation schemas
 */

export const createSupplierSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(200).required().messages({
      'string.empty': 'Supplier name is required',
      'string.min': 'Supplier name must be at least 2 characters',
      'string.max': 'Supplier name cannot exceed 200 characters',
    }),
    code: Joi.string()
      .pattern(/^[A-Z0-9-]+$/)
      .required()
      .messages({
        'string.empty': 'Supplier code is required',
        'string.pattern.base': 'Supplier code must contain only uppercase letters, numbers, and hyphens',
      }),
    contactPerson: Joi.string().allow('', null).optional(),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .required()
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    address: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        postalCode: Joi.string(),
      })
    ).optional(),
    status: Joi.string().valid(...Object.values(SUPPLIER_STATUS)).optional(),
    paymentTerms: Joi.string().optional(),
    taxId: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    notes: Joi.string().max(1000).optional(),
  }),
});

export const updateSupplierSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(200),
    contactPerson: Joi.string().allow('', null),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
    address: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        postalCode: Joi.string(),
      })
    ),
    status: Joi.string().valid(...Object.values(SUPPLIER_STATUS)),
    paymentTerms: Joi.string(),
    taxId: Joi.string(),
    website: Joi.string().uri(),
    notes: Joi.string().max(1000),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getSupplierSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deleteSupplierSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const listSuppliersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid(...Object.values(SUPPLIER_STATUS)),
    search: Joi.string(),
    sortBy: Joi.string().valid('name', 'createdAt', 'code'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});
