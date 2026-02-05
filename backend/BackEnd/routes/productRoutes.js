import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getProductsBySupplier,
} from '../controllers/productController.js';
import validate from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, updateStockSchema } from '../validators/productValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Product Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', getLowStockProducts);

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Private
router.get('/categories', getCategories);

// @route   GET /api/products/supplier/:supplierId
// @desc    Get products by supplier
// @access  Private
router.get('/supplier/:supplierId', getProductsBySupplier);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin, Manager)
router.post(
  '/',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validate(createProductSchema),
  createProduct
);

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Private
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin, Manager)
router.put(
  '/:id',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validate(updateProductSchema),
  updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authorize([USER_ROLES.ADMIN]), deleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin, Manager)
router.patch(
  '/:id/stock',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validate(updateStockSchema),
  updateStock
);

export default router;
