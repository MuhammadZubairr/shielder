import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import warehouseValidator from '../validators/warehouseValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/warehouses/active/list
 * @desc    Get active warehouses (for dropdowns)
 * @access  Private
 */
router.get(
  '/active/list',
  warehouseController.getActiveWarehouses
);

/**
 * @route   GET /api/warehouses
 * @desc    Get all warehouses with filtering and pagination
 * @access  Private (Admin/Manager)
 */
router.get(
  '/',
  authorize(['admin', 'manager']),
  validate(warehouseValidator.queryWarehouses, 'query'),
  warehouseController.getAllWarehouses
);

/**
 * @route   POST /api/warehouses
 * @desc    Create new warehouse
 * @access  Private (Admin)
 */
router.post(
  '/',
  authorize(['admin']),
  validate(warehouseValidator.createWarehouse),
  warehouseController.createWarehouse
);

/**
 * @route   POST /api/warehouses/transfer
 * @desc    Transfer inventory between warehouses
 * @access  Private (Admin/Manager)
 */
router.post(
  '/transfer',
  authorize(['admin', 'manager']),
  validate(warehouseValidator.warehouseTransfer),
  warehouseController.transferInventory
);

/**
 * @route   GET /api/warehouses/code/:code
 * @desc    Get warehouse by code
 * @access  Private (Admin/Manager)
 */
router.get(
  '/code/:code',
  authorize(['admin', 'manager']),
  warehouseController.getWarehouseByCode
);

/**
 * @route   GET /api/warehouses/:id
 * @desc    Get warehouse by ID
 * @access  Private (Admin/Manager)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager']),
  warehouseController.getWarehouseById
);

/**
 * @route   PUT /api/warehouses/:id
 * @desc    Update warehouse
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authorize(['admin']),
  validate(warehouseValidator.updateWarehouse),
  warehouseController.updateWarehouse
);

/**
 * @route   DELETE /api/warehouses/:id
 * @desc    Delete warehouse
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authorize(['admin']),
  warehouseController.deleteWarehouse
);

/**
 * @route   GET /api/warehouses/:id/inventory
 * @desc    Get warehouse inventory
 * @access  Private (Admin/Manager)
 */
router.get(
  '/:id/inventory',
  authorize(['admin', 'manager']),
  warehouseController.getWarehouseInventory
);

/**
 * @route   GET /api/warehouses/:id/stats
 * @desc    Get warehouse statistics
 * @access  Private (Admin/Manager)
 */
router.get(
  '/:id/stats',
  authorize(['admin', 'manager']),
  warehouseController.getWarehouseStats
);

export default router;
