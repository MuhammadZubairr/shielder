import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';

/**
 * User Dashboard Controller
 * Handles requests for operational user dashboard
 */

/**
 * @route   GET /api/user-dashboard/stats
 * @desc    Get dashboard stats for logged-in user (warehouse-specific)
 * @access  Private (Staff/Manager)
 */
export const getUserDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user with warehouse
  const user = await User.findById(userId).populate('warehouse', 'code name location capacity');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Admin users don't have warehouse restriction
  if (user.role === USER_ROLES.ADMIN) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin users should use admin dashboard');
  }

  if (!user.warehouse) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No warehouse assigned to this user');
  }

  const warehouseId = user.warehouse._id;

  // Get warehouse-specific stats
  const [
    totalProducts,
    lowStockProductsResult,
    recentTransactions,
    warehouseStock,
  ] = await Promise.all([
    // Total products in user's warehouse
    Product.countDocuments({
      'warehouseStock.warehouse': warehouseId,
    }),

    // Low stock products in user's warehouse using aggregation
    Product.aggregate([
      { $unwind: '$warehouseStock' },
      { 
        $match: { 
          'warehouseStock.warehouse': warehouseId 
        } 
      },
      {
        $addFields: {
          isLowStock: {
            $lte: ['$warehouseStock.quantity', '$warehouseStock.minStockLevel']
          }
        }
      },
      { $match: { isLowStock: true } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          warehouseQuantity: '$warehouseStock.quantity',
          minStockLevel: '$warehouseStock.minStockLevel'
        }
      }
    ]),

    // Recent transactions for this warehouse
    Transaction.find({ warehouse: warehouseId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('product', 'name sku')
      .populate('performedBy', 'name'),

    // Calculate total stock value in warehouse
    Product.aggregate([
      { $unwind: '$warehouseStock' },
      { $match: { 'warehouseStock.warehouse': warehouseId } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$warehouseStock.quantity' },
          totalValue: { $sum: { $multiply: ['$unitPrice', '$warehouseStock.quantity'] } },
        },
      },
    ]),
  ]);

  const stockValue = warehouseStock[0] || { totalQuantity: 0, totalValue: 0 };

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        warehouse: user.warehouse,
        stats: {
          totalProducts,
          lowStockCount: lowStockProductsResult.length,
          totalQuantity: stockValue.totalQuantity,
          totalValue: stockValue.totalValue,
        },
        lowStockProducts: lowStockProductsResult,
        recentTransactions,
      },
      'User dashboard stats fetched successfully'
    )
  );
});

/**
 * @route   GET /api/user-dashboard/warehouse-products
 * @desc    Get all products in user's assigned warehouse
 * @access  Private (Staff/Manager)
 */
export const getWarehouseProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search } = req.query;

  const user = await User.findById(userId);
  if (!user || !user.warehouse) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No warehouse assigned');
  }

  const filter = {
    'warehouseStock.warehouse': user.warehouse,
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 }),
    Product.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Warehouse products fetched successfully'
    )
  );
});
