import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { validate } from '../../common/middleware/validation.middleware';
import { profileValidation } from './profile.validation';
import { UserRole } from '../../types/rbac.types';
import { upload } from '../../common/middleware/upload.middleware';

const router = Router();

/**
 * All profile routes require authentication
 */
router.use(authenticate);

// GET /api/profile - Get own profile
router.get('/', ProfileController.getMyProfile);

// PUT /api/profile - Update own profile
router.put('/', validate(profileValidation.updateProfile), ProfileController.updateMyProfile);

// PATCH /api/profile/language - Update language preference
router.patch('/language', validate(profileValidation.updateLanguage), ProfileController.updateLanguage);

// PATCH /api/profile/preferences - Update theme/other preferences
router.patch('/preferences', ProfileController.updatePreferences);

// POST /api/profile/upload-image - Upload profile image
router.post('/upload-image', upload.single('profileImage'), ProfileController.uploadProfileImage);

// GET /api/profile/:userId - Admin view any profile (Read-only)
router.get('/:userId', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), ProfileController.getProfileById);

export default router;
