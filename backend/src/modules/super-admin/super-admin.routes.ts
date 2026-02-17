/**
 * Super Admin Routes
 */

import { Router } from 'express';
import { superAdminController } from './super-admin.controller';
import { authenticate } from '../auth/auth.middleware';
import { requireSuperAdmin } from '../../common/middleware/rbac.middleware';

const router = Router();

// All routes require Super Admin
router.use(authenticate, requireSuperAdmin);

// User Management Statistics
router.get('/users/stats', superAdminController.getUserStats.bind(superAdminController));

// Get all users (with filters)
router.get('/users/all', superAdminController.getAllUsers.bind(superAdminController));

// Create a new user (of any permitted role)
router.post('/users/create', superAdminController.createUser.bind(superAdminController));

// Update user details, role, or status
router.put('/users/:id', superAdminController.updateUser.bind(superAdminController));

// Delete user (Soft Delete)
router.delete('/users/:id', superAdminController.deleteUser.bind(superAdminController));

// Statistics & Dashboards
router.get('/statistics', superAdminController.getStatistics.bind(superAdminController));
router.get('/dashboard/summary', superAdminController.getDashboardSummary.bind(superAdminController));
router.get('/analytics/monthly', superAdminController.getMonthlyAnalytics.bind(superAdminController));
router.get('/activity', superAdminController.getRecentActivity.bind(superAdminController));


export default router;
