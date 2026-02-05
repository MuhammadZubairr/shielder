import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,
} from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/userValidator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication Routes
 * All routes are public except logout and getCurrentUser
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   POST /api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private
router.post('/logout', authenticate, logout);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', authenticate, getCurrentUser);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', verifyToken);

// @route   GET /api/auth/validate
// @desc    Validate JWT token from Authorization header
// @access  Private
router.get('/validate', authenticate, (req, res) => {
  // If authenticate middleware passes, token is valid
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: { user: req.user }
  });
});

export default router;
