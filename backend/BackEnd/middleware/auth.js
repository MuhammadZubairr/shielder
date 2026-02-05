import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * Following security best practices
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header or cookie
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Note: Server instance check disabled to allow tokens to persist across restarts
    // If you need this security feature, implement a token blacklist instead
    // Check if token was issued by current server instance
    // if (decoded.sid !== global.SERVER_INSTANCE_ID) {
    //   logger.warn('Token from previous server instance detected', {
    //     tokenSid: decoded.sid,
    //     currentSid: global.SERVER_INSTANCE_ID
    //   });
    //   throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please login again.');
    // }
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug('User authenticated:', { userId: req.user.id, role: req.user.role });
    
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token.');
  }
});

/**
 * Authorization middleware factory
 * Checks if user has required role(s)
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated.');
    }

    // Handle both array and spread arguments
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt:', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to perform this action.'
      );
    }

    next();
  };
};
