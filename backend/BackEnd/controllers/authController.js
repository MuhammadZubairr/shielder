import authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 * Following separation of concerns - no business logic here
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;

  const result = await authService.register({
    name,
    email,
    password,
    role,
    phone,
    department,
  });

  // Set token in cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      {
        user: result.user,
        token: result.token,
      },
      'User registered successfully'
    )
  );
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  // Set token in cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        user: result.user,
        token: result.token,
      },
      'Login successful'
    )
  );
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.clearCookie('token');

  logger.info('User logged out', { userId: req.user?.id });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Logout successful')
  );
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
  }

  const user = await authService.verifyToken(token);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, { user }, 'User retrieved successfully')
  );
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Public
 */
export const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Token is required');
  }

  const user = await authService.verifyToken(token);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, { user }, 'Token is valid')
  );
});
