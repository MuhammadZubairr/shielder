import dashboardService from '../services/dashboardService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard and reports
 */

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard overview statistics
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, stats, 'Dashboard statistics fetched successfully')
  );
});

/**
 * @route   GET /api/dashboard/trends/monthly
 * @desc    Get monthly transaction trends
 * @access  Private
 */
export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getMonthlyTrends();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, trends, 'Monthly trends fetched successfully')
  );
});

/**
 * @route   GET /api/dashboard/trends/weekly
 * @desc    Get weekly transaction trends (last 7 days)
 * @access  Private
 */
export const getWeeklyTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getWeeklyTrends();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, trends, 'Weekly trends fetched successfully')
  );
});

/**
 * @route   GET /api/dashboard/trends/yearly
 * @desc    Get yearly transaction trends (last 5 years)
 * @access  Private
 */
export const getYearlyTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getYearlyTrends();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, trends, 'Yearly trends fetched successfully')
  );
});

/**
 * @route   GET /api/dashboard/reports/inventory
 * @desc    Get inventory report
 * @access  Private
 */
export const getInventoryReport = asyncHandler(async (req, res) => {
  const report = await dashboardService.getInventoryReport(req.query);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, report, 'Inventory report generated successfully')
  );
});

/**
 * @route   GET /api/dashboard/reports/transactions
 * @desc    Get transaction report
 * @access  Private
 */
export const getTransactionReport = asyncHandler(async (req, res) => {
  const report = await dashboardService.getTransactionReport(req.query);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, report, 'Transaction report generated successfully')
  );
});

/**
 * @route   GET /api/dashboard/reports/stock-movement
 * @desc    Get stock movement report
 * @access  Private
 */
export const getStockMovementReport = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const report = await dashboardService.getStockMovementReport(days);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, report, 'Stock movement report generated successfully')
  );
});

/**
 * @route   GET /api/dashboard/alerts/low-stock
 * @desc    Get low stock alert
 * @access  Private
 */
export const getLowStockAlert = asyncHandler(async (req, res) => {
  const alert = await dashboardService.getLowStockAlert();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, alert, 'Low stock alert fetched successfully')
  );
});

/**
 * @route   GET /api/dashboard/reports/suppliers
 * @desc    Get supplier performance report
 * @access  Private
 */
export const getSupplierReport = asyncHandler(async (req, res) => {
  const report = await dashboardService.getSupplierReport();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, report, 'Supplier report generated successfully')
  );
});
