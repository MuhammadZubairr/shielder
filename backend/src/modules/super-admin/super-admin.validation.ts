/**
 * Super Admin Validation
 */

import Joi from 'joi';
import { UserRole, UserStatus } from '../../common/constants/roles';

export const superAdminValidation = {
  createAdmin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }),

  updateRole: Joi.object({
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required(),
  }),

  updateStatus: Joi.object({
    isActive: Joi.boolean().required(),
  }),

  updateAdmin: Joi.object({
    fullName: Joi.string().optional().allow(''),
    phoneNumber: Joi.string().optional().allow(''),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().valid(...Object.values(UserStatus)).optional(),
  }),

  queryParams: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().optional().allow(''),
    role: Joi.string().valid(...Object.values(UserRole)).optional().allow(''),
    status: Joi.string().valid(...Object.values(UserStatus)).optional().allow(''),
    isActive: Joi.boolean().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
  }),
};
