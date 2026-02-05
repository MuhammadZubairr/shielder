import productService from '../services/productService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Product Controller
 * Handles HTTP requests for product management
 */

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin, Manager)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const productData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const product = await productService.createProduct(productData);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, { product }, 'Product created successfully')
  );
});

/**
 * @route   GET /api/products
 * @desc    Get all products with filters and pagination
 * @access  Private
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Products fetched successfully')
  );
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, product, 'Product fetched successfully')
  );
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin, Manager)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, product, 'Product updated successfully')
  );
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Product deleted successfully')
  );
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Admin, Manager)
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity, type } = req.body;
  const product = await productService.updateStock(req.params.id, quantity, type);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, product, 'Stock updated successfully')
  );
});

/**
 * @route   GET /api/products/low-stock
 * @desc    Get low stock products
 * @access  Private
 */
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await productService.getLowStockProducts();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, products, 'Low stock products fetched successfully')
  );
});

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Private
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, categories, 'Categories fetched successfully')
  );
});

/**
 * @route   GET /api/products/supplier/:supplierId
 * @desc    Get products by supplier
 * @access  Private
 */
export const getProductsBySupplier = asyncHandler(async (req, res) => {
  const products = await productService.getProductsBySupplier(req.params.supplierId);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, products, 'Products fetched successfully')
  );
});
