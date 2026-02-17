/**
 * Reports Routes
 * Defines API endpoints for Super Admin reports
 */

import { Router } from 'express';
import ReportsController from './reports.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { UserRole } from '@/common/constants/roles';

const router = Router();

// All report routes require Super Admin authentication
router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN));

/**
 * @route   GET /api/reports/overview
 * @desc    Get dashboard summary cards
 */
router.get('/overview', ReportsController.getOverview);

/**
 * @route   GET /api/reports/sales
 * @desc    Get detailed sales report
 */
router.get('/sales', ReportsController.getSalesReport);

/**
 * @route   GET /api/reports/sales/export
 * @desc    Export sales report (PDF, Excel, CSV)
 */
router.get('/sales/export', ReportsController.exportSalesReport);

/**
 * @route   GET /api/reports/orders
 * @desc    Get detailed order report
 */
router.get('/orders', ReportsController.getOrderReport);

/**
 * @route   GET /api/reports/inventory
 * @desc    Get detailed inventory report
 */
router.get('/inventory', ReportsController.getInventoryReport);

/**
 * @route   GET /api/reports/payments
 * @desc    Get detailed payment report
 */
router.get('/payments', ReportsController.getPaymentReport);

/**
 * @route   GET /api/reports/profit-loss
 * @desc    Get detailed P&L report
 */
router.get('/profit-loss', ReportsController.getProfitLossReport);

/**
 * @route   POST /api/reports/export/log
 * @desc    Log a report export action
 */
router.post('/export/log', ReportsController.logExport);

export default router;
