import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';

/**
 * Warehouse Service
 * Business logic for warehouse management
 */

class WarehouseService {
  /**
   * Get all warehouses with filtering, sorting, and pagination
   */
  async getAllWarehouses(filters = {}) {
    const {
      search,
      status,
      city,
      state,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // City filter
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // State filter
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [warehouses, total] = await Promise.all([
      Warehouse.find(query)
        .populate('manager', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Warehouse.countDocuments(query)
    ]);

    return {
      warehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(warehouseId) {
    const warehouse = await Warehouse.findById(warehouseId)
      .populate('manager', 'name email')
      .populate('createdBy', 'name email');

    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    return warehouse;
  }

  /**
   * Get warehouse by code
   */
  async getWarehouseByCode(code) {
    const warehouse = await Warehouse.findOne({ code: code.toUpperCase() })
      .populate('manager', 'name email')
      .populate('createdBy', 'name email');

    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    return warehouse;
  }

  /**
   * Create new warehouse
   */
  async createWarehouse(warehouseData, userId) {
    // Check if warehouse code already exists
    const existingWarehouse = await Warehouse.findOne({ 
      code: warehouseData.code.toUpperCase() 
    });

    if (existingWarehouse) {
      throw new ApiError(400, 'Warehouse code already exists');
    }

    const warehouse = new Warehouse({
      ...warehouseData,
      createdBy: userId
    });

    await warehouse.save();
    await warehouse.populate('createdBy', 'name email');

    return warehouse;
  }

  /**
   * Update warehouse
   */
  async updateWarehouse(warehouseId, updateData, userId) {
    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    // Check if updating code and if it already exists
    if (updateData.code && updateData.code !== warehouse.code) {
      const existingWarehouse = await Warehouse.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: warehouseId }
      });

      if (existingWarehouse) {
        throw new ApiError(400, 'Warehouse code already exists');
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key === 'location' && typeof updateData.location === 'object') {
        warehouse.location = { ...warehouse.location, ...updateData.location };
      } else {
        warehouse[key] = updateData[key];
      }
    });

    await warehouse.save();
    await warehouse.populate(['manager', 'createdBy'], 'name email');

    return warehouse;
  }

  /**
   * Delete warehouse
   */
  async deleteWarehouse(warehouseId) {
    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    // Check if warehouse has products
    const productsCount = await Product.countDocuments({
      'warehouseStock.warehouse': warehouseId
    });

    if (productsCount > 0) {
      throw new ApiError(400, `Cannot delete warehouse. It contains ${productsCount} products. Please move or remove products first.`);
    }

    await warehouse.deleteOne();

    return { message: 'Warehouse deleted successfully' };
  }

  /**
   * Get active warehouses (for dropdowns)
   */
  async getActiveWarehouses() {
    const warehouses = await Warehouse.find({ status: 'active' })
      .select('code name location')
      .sort({ name: 1 })
      .lean();

    return warehouses;
  }

  /**
   * Get warehouse inventory (products in warehouse)
   */
  async getWarehouseInventory(warehouseId, filters = {}) {
    const warehouse = await this.getWarehouseById(warehouseId);

    const { search, category, status, page = 1, limit = 50 } = filters;

    const query = {
      'warehouseStock.warehouse': warehouseId
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('supplier', 'name code')
      .populate('warehouseStock.warehouse', 'code name')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter to show only the warehouse stock
    const inventoryItems = products.map(product => {
      const warehouseStock = product.warehouseStock.find(
        ws => ws.warehouse._id.toString() === warehouseId.toString()
      );

      return {
        ...product,
        warehouseQuantity: warehouseStock?.quantity || 0,
        warehouseLocation: warehouseStock?.location || '',
        warehouseMinStock: warehouseStock?.minStockLevel || 0,
        isLowStockInWarehouse: warehouseStock?.quantity <= warehouseStock?.minStockLevel
      };
    });

    return {
      warehouse,
      inventory: inventoryItems,
      stats: {
        totalProducts: inventoryItems.length,
        lowStockItems: inventoryItems.filter(item => item.isLowStockInWarehouse).length
      }
    };
  }

  /**
   * Get warehouse statistics
   */
  async getWarehouseStats(warehouseId) {
    const warehouse = await this.getWarehouseById(warehouseId);

    const products = await Product.find({
      'warehouseStock.warehouse': warehouseId
    }).lean();

    const stats = {
      totalProducts: products.length,
      totalValue: 0,
      totalQuantity: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };

    products.forEach(product => {
      const warehouseStock = product.warehouseStock.find(
        ws => ws.warehouse.toString() === warehouseId.toString()
      );

      if (warehouseStock) {
        stats.totalQuantity += warehouseStock.quantity;
        stats.totalValue += warehouseStock.quantity * product.unitPrice;

        if (warehouseStock.quantity === 0) {
          stats.outOfStockItems++;
        } else if (warehouseStock.quantity <= warehouseStock.minStockLevel) {
          stats.lowStockItems++;
        }
      }
    });

    return {
      warehouse,
      stats
    };
  }

  /**
   * Transfer inventory between warehouses
   */
  async transferInventory(transferData, userId) {
    const { productId, fromWarehouse, toWarehouse, quantity, notes } = transferData;

    // Validate warehouses exist
    const [sourceWarehouse, destWarehouse] = await Promise.all([
      this.getWarehouseById(fromWarehouse),
      this.getWarehouseById(toWarehouse)
    ]);

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check source warehouse stock
    const sourceStock = product.warehouseStock.find(
      ws => ws.warehouse.toString() === fromWarehouse.toString()
    );

    if (!sourceStock) {
      throw new ApiError(400, `Product not found in source warehouse ${sourceWarehouse.name}`);
    }

    if (sourceStock.quantity < quantity) {
      throw new ApiError(400, `Insufficient stock in ${sourceWarehouse.name}. Available: ${sourceStock.quantity}, Requested: ${quantity}`);
    }

    // Update source warehouse stock
    sourceStock.quantity -= quantity;

    // Update or create destination warehouse stock
    let destStock = product.warehouseStock.find(
      ws => ws.warehouse.toString() === toWarehouse.toString()
    );

    if (destStock) {
      destStock.quantity += quantity;
      destStock.lastRestocked = new Date();
    } else {
      product.warehouseStock.push({
        warehouse: toWarehouse,
        quantity: quantity,
        minStockLevel: product.minStockLevel,
        lastRestocked: new Date()
      });
    }

    // Update total quantity
    product.quantity = product.warehouseStock.reduce((total, ws) => total + ws.quantity, 0);

    await product.save();

    // Create transaction records for audit trail
    const transferNote = notes || `Transfer from ${sourceWarehouse.name} to ${destWarehouse.name}`;
    const unitPrice = product.unitPrice || 0;
    const totalPrice = quantity * unitPrice;

    await Transaction.create([
      {
        transactionNumber: `TRANS-OUT-${Date.now()}`,
        product: productId,
        type: 'stock_out',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        warehouse: fromWarehouse,
        notes: transferNote,
        performedBy: userId,
        status: 'completed'
      },
      {
        transactionNumber: `TRANS-IN-${Date.now() + 1}`,
        product: productId,
        type: 'stock_in',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        warehouse: toWarehouse,
        notes: transferNote,
        performedBy: userId,
        status: 'completed'
      }
    ]);

    return {
      success: true,
      message: `Successfully transferred ${quantity} units from ${sourceWarehouse.name} to ${destWarehouse.name}`,
      product: await Product.findById(productId).populate('warehouseStock.warehouse', 'code name')
    };
  }
}

export default new WarehouseService();
