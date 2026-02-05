import express from 'express';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  updateProfile,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
  changePasswordSchema,
} from '../validators/userValidator.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * User Routes
 * All routes require authentication
 * Some routes require admin role
 */

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authenticate,
  upload.single('profileImage'),
  updateProfile
);

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), getAllUsers);

// @route   POST /api/users
// @desc    Create a new user
// @access  Private/Admin
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(createUserSchema),
  createUser
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, validate(getUserSchema), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updateUserSchema),
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(deleteUserSchema),
  deleteUser
);

// @route   POST /api/users/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
