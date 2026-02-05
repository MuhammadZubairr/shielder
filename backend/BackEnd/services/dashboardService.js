import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, PRODUCT_STATUS, TRANSACTION_TYPES } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Dashboard Service
 * Business logic for dashboard statistics and reports
 */

class DashboardService {
  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats() {
    try {
      const [
        totalProducts,
        totalSuppliers,
        totalUsers,
        lowStockProducts,
        outOfStockProducts,
        recentTransactions,
        productsByCategory,
        stockValue,
      ] = await Promise.all([
        // Total products
        Product.countDocuments(),
        
        // Total suppliers (active status)
        Supplier.countDocuments({ status: 'active' }),
        
        // Total users
        User.countDocuments(),
        
        // Low stock products count (includes both low stock and out of stock)
        Product.countDocuments({
          $or: [
            { status: PRODUCT_STATUS.LOW_STOCK },
            { status: PRODUCT_STATUS.OUT_OF_STOCK },
          ],
        }),
        
        // Out of stock products count
        Product.countDocuments({ status: PRODUCT_STATUS.OUT_OF_STOCK }),
        
        // Recent transactions (last 10)
        Transaction.find()
          .populate('product', 'name sku')
          .populate('performedBy', 'name')
          .sort({ createdAt: -1 })
          .limit(10),
        
        // Products by category
        Product.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
            },
          },
          { $sort: { count: -1 } },
        ]),
        
        // Total stock value
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalValue: { $sum: { $multiply: ['$unitPrice', '$quantity'] } },
              totalQuantity: { $sum: '$quantity' },
            },
          },
        ]),
      ]);

      return {
        overview: {
          totalProducts,
          totalSuppliers,
          totalUsers,
          lowStockProducts,
          outOfStockProducts,
          stockValue: stockValue[0] || { totalValue: 0, totalQuantity: 0 },
        },
        recentTransactions,
        productsByCategory,
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get monthly transaction trends (last 12 months)
   */
  async getMonthlyTrends() {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const trends = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: twelveMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              type: '$type'
            },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Format data for chart
      const months = [];
      const stockIn = [];
      const stockOut = [];
      
      // Generate last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        months.push(monthName);
        
        // Find matching data
        const inData = trends.find(t => 
          t._id.year === year && 
          t._id.month === month && 
          t._id.type === TRANSACTION_TYPES.STOCK_IN
        );
        const outData = trends.find(t => 
          t._id.year === year && 
          t._id.month === month && 
          t._id.type === TRANSACTION_TYPES.STOCK_OUT
        );
        
        stockIn.push(inData ? inData.totalQuantity : 0);
        stockOut.push(outData ? outData.totalQuantity : 0);
      }

      return {
        labels: months,
        stockIn,
        stockOut
      };
    } catch (error) {
      logger.error('Error fetching monthly trends:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch monthly trends');
    }
  }

  /**
   * Get weekly transaction trends (last 7 days)
   */
  async getWeeklyTrends() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trends = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              type: '$type'
            },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      // Format data for chart
      const labels = [];
      const stockIn = [];
      const stockOut = [];
      
      // Generate last 7 days
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayName = date.toLocaleString('en-US', { weekday: 'short' });
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        labels.push(dayName);
        
        // Find matching data
        const inData = trends.find(t => 
          t._id.year === year && 
          t._id.month === month && 
          t._id.day === day &&
          t._id.type === TRANSACTION_TYPES.STOCK_IN
        );
        const outData = trends.find(t => 
          t._id.year === year && 
          t._id.month === month && 
          t._id.day === day &&
          t._id.type === TRANSACTION_TYPES.STOCK_OUT
        );
        
        stockIn.push(inData ? inData.totalQuantity : 0);
        stockOut.push(outData ? outData.totalQuantity : 0);
      }

      return {
        labels,
        stockIn,
        stockOut
      };
    } catch (error) {
      logger.error('Error fetching weekly trends:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch weekly trends');
    }
  }

  /**
   * Get yearly transaction trends (last 5 years)
   */
  async getYearlyTrends() {
    try {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      const trends = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: fiveYearsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              type: '$type'
            },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        {
          $sort: { '_id.year': 1 }
        }
      ]);

      // Format data for chart
      const labels = [];
      const stockIn = [];
      const stockOut = [];
      
      // Generate last 5 years
      const now = new Date();
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        
        labels.push(year.toString());
        
        // Find matching data
        const inData = trends.find(t => 
          t._id.year === year && 
          t._id.type === TRANSACTION_TYPES.STOCK_IN
        );
        const outData = trends.find(t => 
          t._id.year === year && 
          t._id.type === TRANSACTION_TYPES.STOCK_OUT
        );
        
        stockIn.push(inData ? inData.totalQuantity : 0);
        stockOut.push(outData ? outData.totalQuantity : 0);
      }

      return {
        labels,
        stockIn,
        stockOut
      };
    } catch (error) {
      logger.error('Error fetching yearly trends:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch yearly trends');
    }
  }

  /**
   * Get inventory report
   */
  async getInventoryReport(options = {}) {
    try {
      const { category, status, minStock, maxStock } = options;
      
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (minStock || maxStock) {
        query.quantity = {};
        if (minStock) query.quantity.$gte = parseInt(minStock);
        if (maxStock) query.quantity.$lte = parseInt(maxStock);
      }

      const products = await Product.find(query)
        .populate('supplier', 'name company')
        .sort({ category: 1, name: 1 });

      const summary = await Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$unitPrice', '$quantity'] } },
            averagePrice: { $avg: '$unitPrice' },
          },
        },
      ]);

      return {
        products,
        summary: summary[0] || { totalProducts: 0, totalQuantity: 0, totalValue: 0, averagePrice: 0 },
      };
    } catch (error) {
      logger.error('Error generating inventory report:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate inventory report');
    }
  }

  /**
   * Get transaction report
   */
  async getTransactionReport(options = {}) {
    try {
      const { startDate, endDate, type } = options;
      
      const query = {};
      if (type) query.type = type;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [transactions, summary] = await Promise.all([
        Transaction.find(query)
          .populate('product', 'name sku unitPrice')
          .populate('supplier', 'name company')
          .populate('performedBy', 'name email')
          .sort({ createdAt: -1 }),
        
        Transaction.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
            },
          },
        ]),
      ]);

      const summaryByType = {
        stockIn: { count: 0, totalQuantity: 0 },
        stockOut: { count: 0, totalQuantity: 0 },
        adjustment: { count: 0, totalQuantity: 0 },
      };

      summary.forEach(item => {
        if (item._id === TRANSACTION_TYPES.STOCK_IN) {
          summaryByType.stockIn = { count: item.count, totalQuantity: item.totalQuantity };
        } else if (item._id === TRANSACTION_TYPES.STOCK_OUT) {
          summaryByType.stockOut = { count: item.count, totalQuantity: item.totalQuantity };
        } else if (item._id === TRANSACTION_TYPES.ADJUSTMENT) {
          summaryByType.adjustment = { count: item.count, totalQuantity: item.totalQuantity };
        }
      });

      return {
        transactions,
        summary: summaryByType,
        totalTransactions: transactions.length,
      };
    } catch (error) {
      logger.error('Error generating transaction report:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate transaction report');
    }
  }

  /**
   * Get stock movement report (last 30 days by default)
   */
  async getStockMovementReport(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const movements = await Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              type: '$type',
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]);

      return movements;
    } catch (error) {
      logger.error('Error generating stock movement report:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate stock movement report');
    }
  }

  /**
   * Get low stock alert report
   */
  async getLowStockAlert() {
    try {
      const lowStockProducts = await Product.find({
        $or: [
          { status: PRODUCT_STATUS.LOW_STOCK },
          { status: PRODUCT_STATUS.OUT_OF_STOCK },
        ],
      })
        .populate('supplier', 'name email phone')
        .sort({ quantity: 1 });

      return {
        products: lowStockProducts,
        total: lowStockProducts.length,
        outOfStock: lowStockProducts.filter(p => p.quantity === 0).length,
        lowStock: lowStockProducts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length,
      };
    } catch (error) {
      logger.error('Error fetching low stock alert:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch low stock alert');
    }
  }

  /**
   * Get supplier performance report
   */
  async getSupplierReport() {
    try {
      const supplierStats = await Product.aggregate([
        {
          $group: {
            _id: '$supplier',
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$unitPrice', '$quantity'] } },
          },
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: '_id',
            foreignField: '_id',
            as: 'supplierInfo',
          },
        },
        { $unwind: '$supplierInfo' },
        {
          $project: {
            supplier: '$supplierInfo.name',
            company: '$supplierInfo.company',
            email: '$supplierInfo.email',
            totalProducts: 1,
            totalStock: 1,
            totalValue: 1,
          },
        },
        { $sort: { totalValue: -1 } },
      ]);

      return supplierStats;
    } catch (error) {
      logger.error('Error generating supplier report:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate supplier report');
    }
  }
}

export default new DashboardService();
