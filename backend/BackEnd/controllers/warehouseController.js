import warehouseService from '../services/warehouseService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Warehouse Controller
 * HTTP request handlers for warehouse operations
 */

/**
 * @desc    Get all warehouses
 * @route   GET /api/warehouses
 * @access  Private (Admin/Manager)
 */
const getAllWarehouses = asyncHandler(async (req, res) => {
  const result = await warehouseService.getAllWarehouses(req.query);

  res.status(200).json(
    new ApiResponse(200, result, 'Warehouses retrieved successfully')
  );
});

/**
 * @desc    Get warehouse by ID
 * @route   GET /api/warehouses/:id
 * @access  Private (Admin/Manager)
 */
const getWarehouseById = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { warehouse }, 'Warehouse retrieved successfully')
  );
});

/**
 * @desc    Get warehouse by code
 * @route   GET /api/warehouses/code/:code
 * @access  Private (Admin/Manager)
 */
const getWarehouseByCode = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseByCode(req.params.code);

  res.status(200).json(
    new ApiResponse(200, { warehouse }, 'Warehouse retrieved successfully')
  );
});

/**
 * @desc    Create new warehouse
 * @route   POST /api/warehouses
 * @access  Private (Admin)
 */
const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.createWarehouse(req.body, req.user.id);

  res.status(201).json(
    new ApiResponse(201, { warehouse }, 'Warehouse created successfully')
  );
});

/**
 * @desc    Update warehouse
 * @route   PUT /api/warehouses/:id
 * @access  Private (Admin)
 */
const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.updateWarehouse(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(200, { warehouse }, 'Warehouse updated successfully')
  );
});

/**
 * @desc    Delete warehouse
 * @route   DELETE /api/warehouses/:id
 * @access  Private (Admin)
 */
const deleteWarehouse = asyncHandler(async (req, res) => {
  const result = await warehouseService.deleteWarehouse(req.params.id);

  res.status(200).json(
    new ApiResponse(200, result, 'Warehouse deleted successfully')
  );
});

/**
 * @desc    Get active warehouses
 * @route   GET /api/warehouses/active/list
 * @access  Private
 */
const getActiveWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await warehouseService.getActiveWarehouses();

  res.status(200).json(
    new ApiResponse(200, { warehouses }, 'Active warehouses retrieved successfully')
  );
});

/**
 * @desc    Get warehouse inventory
 * @route   GET /api/warehouses/:id/inventory
 * @access  Private (Admin/Manager)
 */
const getWarehouseInventory = asyncHandler(async (req, res) => {
  const result = await warehouseService.getWarehouseInventory(
    req.params.id,
    req.query
  );

  res.status(200).json(
    new ApiResponse(200, result, 'Warehouse inventory retrieved successfully')
  );
});

/**
 * @desc    Get warehouse statistics
 * @route   GET /api/warehouses/:id/stats
 * @access  Private (Admin/Manager)
 */
const getWarehouseStats = asyncHandler(async (req, res) => {
  const result = await warehouseService.getWarehouseStats(req.params.id);

  res.status(200).json(
    new ApiResponse(200, result, 'Warehouse statistics retrieved successfully')
  );
});

/**
 * @desc    Transfer inventory between warehouses
 * @route   POST /api/warehouses/transfer
 * @access  Private (Admin/Manager)
 */
const transferInventory = asyncHandler(async (req, res) => {
  const result = await warehouseService.transferInventory(req.body, req.user.id);

  res.status(200).json(
    new ApiResponse(200, result, 'Inventory transferred successfully')
  );
});

export default {
  getAllWarehouses,
  getWarehouseById,
  getWarehouseByCode,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getActiveWarehouses,
  getWarehouseInventory,
  getWarehouseStats,
  transferInventory
};
