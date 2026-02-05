import Joi from 'joi';

/**
 * Validation schemas for Warehouse operations
 */

// Create warehouse validation
const createWarehouse = Joi.object({
  body: Joi.object({
    code: Joi.string()
      .pattern(/^WH-[A-Z0-9]+$/)
      .uppercase()
      .required()
      .messages({
        'string.pattern.base': 'Warehouse code must start with WH- followed by alphanumeric characters',
        'any.required': 'Warehouse code is required'
      }),
    name: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Warehouse name must be at least 2 characters',
        'string.max': 'Warehouse name cannot exceed 200 characters',
        'any.required': 'Warehouse name is required'
      }),
    location: Joi.object({
      address: Joi.string().required().messages({
        'any.required': 'Address is required'
      }),
      city: Joi.string().required().messages({
        'any.required': 'City is required'
      }),
      state: Joi.string().required().messages({
        'any.required': 'State is required'
      }),
      country: Joi.string().default('USA'),
      zipCode: Joi.string().required().messages({
        'any.required': 'Zip code is required'
      })
    }).required(),
    contactPerson: Joi.string().allow('', null),
    phone: Joi.string().required().messages({
      'any.required': 'Phone number is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
    capacity: Joi.number().min(0).default(0),
    manager: Joi.string().allow('', null)
  })
});

// Update warehouse validation
const updateWarehouse = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    code: Joi.string()
      .pattern(/^WH-[A-Z0-9]+$/)
      .uppercase()
      .messages({
        'string.pattern.base': 'Warehouse code must start with WH- followed by alphanumeric characters'
      }),
    name: Joi.string()
      .min(2)
      .max(200)
      .messages({
        'string.min': 'Warehouse name must be at least 2 characters',
        'string.max': 'Warehouse name cannot exceed 200 characters'
      }),
    location: Joi.object({
      address: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    }),
    contactPerson: Joi.string().allow('', null),
    phone: Joi.string(),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email'
    }),
    status: Joi.string().valid('active', 'inactive', 'maintenance'),
    capacity: Joi.number().min(0),
    manager: Joi.string().allow('', null)
  }).min(1) // At least one field must be provided
});

// Query parameters validation
const queryWarehouses = Joi.object({
  query: Joi.object({
    search: Joi.string().allow(''),
    status: Joi.string().valid('active', 'inactive', 'maintenance'),
    city: Joi.string(),
    state: Joi.string(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
});

// Warehouse transfer validation
const warehouseTransfer = Joi.object({
  body: Joi.object({
    productId: Joi.string().required().messages({
      'any.required': 'Product ID is required'
    }),
    fromWarehouse: Joi.string().required().messages({
      'any.required': 'Source warehouse is required'
    }),
    toWarehouse: Joi.string().required().messages({
      'any.required': 'Destination warehouse is required'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
    notes: Joi.string().allow('', null).max(500)
  }).custom((value, helpers) => {
    if (value.fromWarehouse === value.toWarehouse) {
      return helpers.error('any.invalid', { message: 'Source and destination warehouses must be different' });
    }
    return value;
  })
});

// Get warehouse by ID validation
const getWarehouseById = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  })
});

// Get warehouse by code validation
const getWarehouseByCode = Joi.object({
  params: Joi.object({
    code: Joi.string().required()
  })
});

// Delete warehouse validation
const deleteWarehouse = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  })
});

export default {
  createWarehouse,
  updateWarehouse,
  queryWarehouses,
  getWarehouseById,
  getWarehouseByCode,
  deleteWarehouse,
  warehouseTransfer
};
