import Supplier from '../models/Supplier.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Supplier Service
 * Business logic for supplier management operations
 */

class SupplierService {
  /**
   * Create a new supplier
   */
  async createSupplier(supplierData) {
    try {
      // Check if supplier with same email already exists
      const existingSupplier = await Supplier.findOne({ email: supplierData.email });
      if (existingSupplier) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Supplier with this email already exists');
      }

      const supplier = await Supplier.create(supplierData);
      logger.info(`Supplier created: ${supplier._id}`);
      return supplier;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error creating supplier:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create supplier');
    }
  }

  /**
   * Get all suppliers with pagination and search
   */
  async getAllSuppliers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      // Build query
      const query = {};

      // Search by name, email, or phone
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute query
      const [suppliers, total] = await Promise.all([
        Supplier.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Supplier.countDocuments(query),
      ]);

      return {
        suppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching suppliers:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch suppliers');
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Supplier not found');
      }

      return supplier;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error fetching supplier:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch supplier');
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(supplierId, updateData) {
    try {
      // If email is being updated, check for duplicates
      if (updateData.email) {
        const existingSupplier = await Supplier.findOne({
          email: updateData.email,
          _id: { $ne: supplierId },
        });

        if (existingSupplier) {
          throw new ApiError(HTTP_STATUS.CONFLICT, 'Supplier with this email already exists');
        }
      }

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!supplier) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Supplier not found');
      }

      logger.info(`Supplier updated: ${supplier._id}`);
      return supplier;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error updating supplier:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update supplier');
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(supplierId) {
    try {
      const supplier = await Supplier.findByIdAndDelete(supplierId);

      if (!supplier) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Supplier not found');
      }

      logger.info(`Supplier deleted: ${supplierId}`);
      return supplier;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error deleting supplier:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete supplier');
    }
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers() {
    try {
      const suppliers = await Supplier.find({ status: 'active' }).sort({ name: 1 });
      return suppliers;
    } catch (error) {
      logger.error('Error fetching active suppliers:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch active suppliers');
    }
  }
}

export default new SupplierService();
