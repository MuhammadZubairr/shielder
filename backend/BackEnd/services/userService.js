import User from '../models/User.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, USER_STATUS } from '../config/constants.js';

/**
 * User Service
 * Contains business logic for user operations
 * Following Single Responsibility Principle
 */

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'User with this email already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      logger.info('User created successfully', { userId: user._id, email: user.email });
      
      return user.toSafeObject();
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const user = await User.findOne({ email }).select('+password');
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by email with warehouse populated
   */
  async findByEmailWithWarehouse(email) {
    try {
      const user = await User.findOne({ email })
        .select('+password')
        .populate('warehouse', 'code name location status');
      return user;
    } catch (error) {
      logger.error('Error finding user by email with warehouse:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }
      return user;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(query = {}) {
    try {
      const { page = 1, limit = 10, role, status, search } = query;
      
      const filter = {};
      if (role) filter.role = role;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .populate('warehouse', 'code name location')
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(filter),
      ]);

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    try {
      // Don't allow password update through this method
      delete updateData.password;

      const user = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      logger.info('User updated successfully', { userId: user._id });
      
      return user.toSafeObject();
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      logger.info('User deleted successfully', { userId });
      
      return user.toSafeObject();
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: Date.now() });
    } catch (error) {
      logger.error('Error updating last login:', error);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info('Password changed successfully', { userId });
      
      return true;
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update profile
   */
  async updateProfile(userId, updateData) {
    try {
      // White list fields that can be updated by the user themselves
      const allowedFields = ['name', 'phone', 'department', 'profileImage'];
      const filteredUpdate = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdate[key] = updateData[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { ...filteredUpdate, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      logger.info('Profile updated successfully', { userId: user._id });
      
      return user.toSafeObject();
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }
  }
}

export default new UserService();
