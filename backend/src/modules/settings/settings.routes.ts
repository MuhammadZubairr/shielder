/**
 * System Settings Routes
 */

import { Router } from 'express';
import SettingsController from './settings.controller';
import { authenticate } from '@/modules/auth/auth.middleware';
import { requireRoles } from '@/common/middleware/rbac.middleware';
import { validate } from '@/common/middleware/validation.middleware';
import { settingsValidation } from './settings.validation';
import { UserRole } from '@/common/constants/roles';

const router = Router();

// All settings routes require Super Admin
router.use(authenticate, requireRoles(UserRole.SUPER_ADMIN));

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 */
router.get('/', SettingsController.getSettings);

/**
 * @route   GET /api/settings/logs
 * @desc    Get settings change logs
 */
router.get('/logs', SettingsController.getLogs);

/**
 * @route   GET /api/settings/snapshots
 * @desc    Get config snapshots
 */
router.get('/snapshots', SettingsController.getSnapshots);

/**
 * @route   POST /api/settings/verify
 * @desc    Verify admin password for sensitive actions
 */
router.post('/verify', validate(settingsValidation.verifyPassword), SettingsController.verifySensitiveAction);

/**
 * @route   POST /api/settings/backup
 * @desc    Manual backup trigger
 */
router.post('/backup', SettingsController.triggerBackup);

/**
 * @route   PUT /api/settings/:section
 * @desc    Update specific settings section
 */
router.put('/general', validate(settingsValidation.updateGeneral), SettingsController.updateSettings);
router.put('/order', validate(settingsValidation.updateOrder), SettingsController.updateSettings);
router.put('/payment', validate(settingsValidation.updatePayment), SettingsController.updateSettings);
router.put('/notification', validate(settingsValidation.updateNotification), SettingsController.updateSettings);
router.put('/security', validate(settingsValidation.updateSecurity), SettingsController.updateSettings);

export default router;
