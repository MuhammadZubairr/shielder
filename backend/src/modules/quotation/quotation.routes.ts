/**
 * Quotation Routes — Super Admin only
 */

import { Router } from 'express';
import { quotationController } from './quotation.controller';
import { authenticate } from '@/modules/auth/auth.middleware';
import { requireSuperAdmin, requireRoles } from '@/common/middleware/rbac.middleware';
import { validate } from '@/common/middleware/validation.middleware';
import { quotationValidation } from './quotation.validation';
import { UserRole } from '@/common/constants/roles';

const router = Router();

// All quotation routes require authentication and admin or super admin role
router.use(authenticate, requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

// Listing & analytics
router.get('/', quotationController.getAll);
router.get('/analytics', quotationController.getAnalytics);

// Cron / admin-triggered expiry job
router.post('/expire-stale', quotationController.expireStale);

// Single quotation CRUD
router.post('/', validate(quotationValidation.create), quotationController.create);
router.get('/:id', quotationController.getById);
router.put('/:id', validate(quotationValidation.update), quotationController.update);
router.delete('/:id', quotationController.delete);

// Lifecycle actions
router.post('/:id/send', quotationController.send);
router.post('/:id/approve', quotationController.approve);
router.post('/:id/reject', validate(quotationValidation.reject), quotationController.reject);
router.post('/:id/convert', quotationController.convertToOrder);
router.post('/:id/reactivate', validate(quotationValidation.reactivate), quotationController.reactivate);

export default router;
