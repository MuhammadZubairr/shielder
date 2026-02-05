import jwt from 'jsonwebtoken';
import userService from './userService.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, USER_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Authentication Service
 * Handles user authentication and token generation
 */

class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      sid: global.SERVER_INSTANCE_ID, // Server Instance ID
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Create user
      const user = await userService.createUser(userData);

      // Generate token
      const token = this.generateToken(user);

      logger.info('User registered successfully', { userId: user._id, email: user.email });

      return {
        user,
        token,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user by email and populate warehouse
      const user = await userService.findByEmailWithWarehouse(email);

      if (!user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
      }

      // Check if user is active
      if (user.status !== USER_STATUS.ACTIVE) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Your account is ${user.status}. Please contact administrator.`
        );
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
      }

      // Update last login
      await userService.updateLastLogin(user._id);

      // Generate token
      const token = this.generateToken(user);

      // Get safe user object
      const safeUser = user.toSafeObject();

      logger.info('User logged in successfully', { userId: user._id, email: user.email });

      return {
        user: safeUser,
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token was issued by current server instance
      if (decoded.sid !== global.SERVER_INSTANCE_ID) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please login again.');
      }
      
      // Get user details
      const user = await userService.findById(decoded.id);

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token');
      }

      return user.toSafeObject();
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token');
    }
  }
}

export default new AuthService();
