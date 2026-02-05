import Joi from 'joi';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '../config/constants.js';

/**
 * Transaction validation schemas
 */

export const createTransactionSchema = Joi.object({
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.values(TRANSACTION_TYPES))
      .required()
      .messages({
        'string.empty': 'Transaction type is required',
        'any.only': 'Invalid transaction type',
      }),
    product: Joi.string().required().messages({
      'string.empty': 'Product is required',
    }),
    warehouse: Joi.string().required().messages({
      'string.empty': 'Warehouse is required',
    }),
    quantity: Joi.number().min(1).required().messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required',
    }),
    unitPrice: Joi.number().min(0).required().messages({
      'number.base': 'Unit price must be a number',
      'number.min': 'Unit price cannot be negative',
      'any.required': 'Unit price is required',
    }),
    supplier: Joi.string().optional().allow('', null),
    referenceNumber: Joi.string().allow('', null).optional(),
    notes: Joi.string().max(500).allow('', null).optional(),
    reason: Joi.string().max(500).allow('', null).optional(),
    transactionDate: Joi.date().default(Date.now),
  }),
});

export const updateTransactionSchema = Joi.object({
  body: Joi.object({
    status: Joi.string().valid(...Object.values(TRANSACTION_STATUS)),
    notes: Joi.string().max(500),
    approvedBy: Joi.string(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getTransactionSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const deleteTransactionSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const listTransactionsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)),
    status: Joi.string().valid(...Object.values(TRANSACTION_STATUS)),
    product: Joi.string(),
    supplier: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string().valid('transactionDate', 'createdAt', 'totalPrice'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});
