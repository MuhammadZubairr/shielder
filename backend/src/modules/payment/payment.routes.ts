import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../auth/auth.middleware';
import { requireRoles } from '../../common/middleware/rbac.middleware';
import { validate, validateQuery } from '../../common/middleware/validation.middleware';
import { UserRole } from '../../common/constants/roles';
import { 
  recordPaymentSchema, 
  refundPaymentSchema, 
  getPaymentsFilterSchema 
} from './payment.validation';

const router = Router();
const controller = new PaymentController();

// All payment routes require authentication
router.use(authenticate);

/**
 * GET /api/payments/stats
 * Get summary cards data
 */
router.get(
  '/stats', 
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF), 
  controller.getStats
);

/**
 * GET /api/payments
 * List all payments with filtering
 */
router.get(
  '/', 
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF), 
  validateQuery(getPaymentsFilterSchema),
  controller.list
);

/**
 * GET /api/payments/:id
 * Get single payment details
 */
router.get(
  '/:id', 
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF), 
  controller.getById
);

/**
 * POST /api/payments
 * Record a manual payment
 */
router.post(
  '/', 
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  validate(recordPaymentSchema),
  controller.record
);

/**
 * POST /api/payments/:id/refund
 * Process a refund for a payment
 */
router.post(
  '/:id/refund', 
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  validate(refundPaymentSchema),
  controller.refund
);

export default router;
