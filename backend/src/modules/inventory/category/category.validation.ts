import Joi from 'joi';

export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().required().trim().max(100),
    description: Joi.string().required().trim().max(1000),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
  }),
  update: Joi.object({
    name: Joi.string().optional().trim().max(100),
    description: Joi.string().optional().trim().max(1000),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
  }),
};

