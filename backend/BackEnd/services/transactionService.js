import Transaction from '../models/Transaction.js';
import productService from './productService.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, TRANSACTION_TYPES, TRANSACTION_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Transaction Service
 * Business logic for inventory transaction operations (Stock In/Out)
 */

class TransactionService {
  /**
   * Create a new transaction (stock in/out)
   */
  async createTransaction(transactionData, userId) {
    try {
      const { product, quantity, type, unitPrice, supplier, warehouse, notes, reason, referenceNumber } = transactionData;

      // Calculate total price
      const totalPrice = quantity * unitPrice;

      // Generate transaction number
      const transactionNumber = await Transaction.generateTransactionNumber(type);

      // Update product stock based on transaction type
      if (type === TRANSACTION_TYPES.STOCK_IN) {
        await productService.updateStock(product, quantity, 'add');
        // Also update warehouse-specific stock
        await productService.updateWarehouseStock(product, warehouse, quantity, 'add');
      } else if (type === TRANSACTION_TYPES.STOCK_OUT) {
        await productService.updateStock(product, quantity, 'subtract');
        // Also update warehouse-specific stock
        await productService.updateWarehouseStock(product, warehouse, quantity, 'subtract');
      }

      // Create transaction record
      const transaction = await Transaction.create({
        transactionNumber,
        product,
        quantity,
        type,
        status: TRANSACTION_STATUS.COMPLETED, // Mark as completed immediately for stock operations
        unitPrice,
        totalPrice,
        supplier: supplier || null,
        warehouse,
        notes,
        reason,
        referenceNumber,
        performedBy: userId,
      });

      await transaction.populate([
        { path: 'product', select: 'name sku quantity' },
        { path: 'supplier', select: 'name company' },
        { path: 'warehouse', select: 'name location' },
        { path: 'performedBy', select: 'name email' },
      ]);

      logger.info(`Transaction created: ${transaction._id}, Type: ${type}`);
      return transaction;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error creating transaction:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create transaction');
    }
  }

  /**
   * Get all transactions with filters and pagination
   */
  async getAllTransactions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type = '',
        product = '',
        supplier = '',
        startDate = '',
        endDate = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      // Build query
      const query = {};

      // Filter by transaction type
      if (type) {
        query.type = type;
      }

      // Filter by product
      if (product) {
        query.product = product;
      }

      // Filter by supplier
      if (supplier) {
        query.supplier = supplier;
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute query
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .populate('product', 'name sku quantity')
          .populate('supplier', 'name company')
          .populate('warehouse', 'name location')
          .populate('performedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Transaction.countDocuments(query),
      ]);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch transactions');
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        .populate('product', 'name sku quantity price')
        .populate('supplier', 'name company email phone')
        .populate('performedBy', 'name email role');

      if (!transaction) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Transaction not found');
      }

      return transaction;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error fetching transaction:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch transaction');
    }
  }

  /**
   * Get transactions by product
   */
  async getTransactionsByProduct(productId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        Transaction.find({ product: productId })
          .populate('supplier', 'name company')
          .populate('performedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Transaction.countDocuments({ product: productId }),
      ]);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching product transactions:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch transactions');
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(options = {}) {
    try {
      const { startDate, endDate } = options;
      const dateFilter = {};

      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      const stats = await Transaction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
          },
        },
      ]);

      const result = {
        stockIn: { count: 0, totalQuantity: 0 },
        stockOut: { count: 0, totalQuantity: 0 },
        adjustment: { count: 0, totalQuantity: 0 },
      };

      stats.forEach(stat => {
        if (stat._id === TRANSACTION_TYPES.STOCK_IN) {
          result.stockIn = { count: stat.count, totalQuantity: stat.totalQuantity };
        } else if (stat._id === TRANSACTION_TYPES.STOCK_OUT) {
          result.stockOut = { count: stat.count, totalQuantity: stat.totalQuantity };
        } else if (stat._id === TRANSACTION_TYPES.ADJUSTMENT) {
          result.adjustment = { count: stat.count, totalQuantity: stat.totalQuantity };
        }
      });

      return result;
    } catch (error) {
      logger.error('Error fetching transaction stats:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch transaction stats');
    }
  }

  /**
   * Delete transaction (Admin only, with stock reversal)
   */
  async deleteTransaction(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Transaction not found');
      }

      // Reverse the stock change
      if (transaction.type === TRANSACTION_TYPES.STOCK_IN) {
        await productService.updateStock(transaction.product, transaction.quantity, 'subtract');
      } else if (transaction.type === TRANSACTION_TYPES.STOCK_OUT) {
        await productService.updateStock(transaction.product, transaction.quantity, 'add');
      }

      await transaction.deleteOne();
      logger.info(`Transaction deleted: ${transactionId}`);
      return transaction;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error deleting transaction:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete transaction');
    }
  }
}

export default new TransactionService();
