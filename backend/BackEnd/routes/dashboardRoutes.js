import express from 'express';
import {
  getDashboardStats,
  getMonthlyTrends,
  getWeeklyTrends,
  getYearlyTrends,
  getInventoryReport,
  getTransactionReport,
  getStockMovementReport,
  getLowStockAlert,
  getSupplierReport,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Dashboard & Reports Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/trends/weekly
// @desc    Get weekly transaction trends (last 7 days)
// @access  Private
router.get('/trends/weekly', getWeeklyTrends);

// @route   GET /api/dashboard/trends/monthly
// @desc    Get monthly transaction trends
// @access  Private
router.get('/trends/monthly', getMonthlyTrends);

// @route   GET /api/dashboard/trends/yearly
// @desc    Get yearly transaction trends (last 5 years)
// @access  Private
router.get('/trends/yearly', getYearlyTrends);

// @route   GET /api/dashboard/alerts/low-stock
// @desc    Get low stock alerts
// @access  Private
router.get('/alerts/low-stock', getLowStockAlert);

// @route   GET /api/dashboard/reports/inventory
// @desc    Get inventory report
// @access  Private
router.get('/reports/inventory', getInventoryReport);

// @route   GET /api/dashboard/reports/transactions
// @desc    Get transaction report
// @access  Private
router.get('/reports/transactions', getTransactionReport);

// @route   GET /api/dashboard/reports/stock-movement
// @desc    Get stock movement report
// @access  Private
router.get('/reports/stock-movement', getStockMovementReport);

// @route   GET /api/dashboard/reports/suppliers
// @desc    Get supplier performance report
// @access  Private
router.get('/reports/suppliers', getSupplierReport);

export default router;
