import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionStats,
  getTransactionById,
  getTransactionsByProduct,
  deleteTransaction,
} from '../controllers/transactionController.js';
import validate from '../middleware/validate.js';
import { createTransactionSchema } from '../validators/transactionValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Transaction Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private
router.get('/stats', getTransactionStats);

// @route   GET /api/transactions/product/:productId
// @desc    Get transactions by product
// @access  Private
router.get('/product/:productId', getTransactionsByProduct);

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private (Admin, Manager, Staff)
router.post(
  '/',
  authorize([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF]),
  validate(createTransactionSchema),
  createTransaction
);

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', getAllTransactions);

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', getTransactionById);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private (Admin only)
router.delete('/:id', authorize([USER_ROLES.ADMIN]), deleteTransaction);

export default router;
