import Joi from 'joi';
import { PaymentMethod } from '@prisma/client';

export const recordPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid order ID',
    'any.required': 'Order ID is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  method: Joi.string().valid(...Object.values(PaymentMethod)).required().messages({
    'any.only': 'Invalid payment method',
    'any.required': 'Payment method is required'
  }),
  transactionId: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

export const refundPaymentSchema = Joi.object({
  notes: Joi.string().optional().allow(''),
});

export const getPaymentsFilterSchema = Joi.object({
  page: Joi.string().optional(),
  limit: Joi.string().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional(),
  method: Joi.string().optional(),
  dateFrom: Joi.string().optional(),
  dateTo: Joi.string().optional(),
});
