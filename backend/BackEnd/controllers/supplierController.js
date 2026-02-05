import supplierService from '../services/supplierService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Supplier Controller
 * Handles HTTP requests for supplier management
 */

/**
 * @route   POST /api/suppliers
 * @desc    Create a new supplier
 * @access  Private (Admin, Manager)
 */
export const createSupplier = asyncHandler(async (req, res) => {
  const supplierData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const supplier = await supplierService.createSupplier(supplierData);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, { supplier }, 'Supplier created successfully')
  );
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with filters and pagination
 * @access  Private
 */
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const result = await supplierService.getAllSuppliers(req.query);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Suppliers fetched successfully')
  );
});

/**
 * @route   GET /api/suppliers/active
 * @desc    Get all active suppliers
 * @access  Private
 */
export const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getActiveSuppliers();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, suppliers, 'Active suppliers fetched successfully')
  );
});

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private
 */
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, supplier, 'Supplier fetched successfully')
  );
});

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Admin, Manager)
 */
export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, supplier, 'Supplier updated successfully')
  );
});

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete supplier
 * @access  Private (Admin)
 */
export const deleteSupplier = asyncHandler(async (req, res) => {
  await supplierService.deleteSupplier(req.params.id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Supplier deleted successfully')
  );
});
