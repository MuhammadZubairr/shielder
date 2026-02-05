import express from 'express';
import {
  createSupplier,
  getAllSuppliers,
  getActiveSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import validate from '../middleware/validate.js';
import { createSupplierSchema, updateSupplierSchema } from '../validators/supplierValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Supplier Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/suppliers/active
// @desc    Get active suppliers
// @access  Private
router.get('/active', getActiveSuppliers);

// @route   POST /api/suppliers
// @desc    Create a new supplier
// @access  Private (Admin, Manager)
router.post(
  '/',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validate(createSupplierSchema),
  createSupplier
);

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', getAllSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
router.get('/:id', getSupplierById);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin, Manager)
router.put(
  '/:id',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validate(updateSupplierSchema),
  updateSupplier
);

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin only)
router.delete('/:id', authorize([USER_ROLES.ADMIN]), deleteSupplier);

export default router;
