import express from 'express';
import { getUserDashboardStats, getWarehouseProducts } from '../controllers/userDashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * User Dashboard Routes
 * All routes require authentication
 * Restricted to Staff, Manager, Viewer roles
 */

// Protect all routes
router.use(authenticate);

// Restrict to non-admin users
router.use(authorize([USER_ROLES.STAFF, USER_ROLES.MANAGER, USER_ROLES.VIEWER]));

// Get user dashboard stats
router.get('/stats', getUserDashboardStats);

// Get warehouse products
router.get('/warehouse-products', getWarehouseProducts);

export default router;
