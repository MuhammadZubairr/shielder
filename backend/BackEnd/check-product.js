import mongoose from 'mongoose';
import Product from './models/Product.js';
import Warehouse from './models/Warehouse.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory';

async function checkProduct() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the most recent product
    const recentProduct = await Product.findOne().sort({ createdAt: -1 }).populate('warehouseStock.warehouse');
    
    console.log('\n=== MOST RECENT PRODUCT ===');
    console.log('Product ID:', recentProduct._id);
    console.log('SKU:', recentProduct.sku);
    console.log('Name:', recentProduct.name);
    console.log('Created At:', recentProduct.createdAt);
    console.log('\nWarehouse Stock Array:');
    console.log(JSON.stringify(recentProduct.warehouseStock, null, 2));

    // Count products with warehouse assignments
    const productsWithWarehouses = await Product.countDocuments({
      warehouseStock: { $exists: true, $ne: [] }
    });
    
    const totalProducts = await Product.countDocuments();
    
    console.log('\n=== STATISTICS ===');
    console.log('Total products:', totalProducts);
    console.log('Products with warehouse assignments:', productsWithWarehouses);
    console.log('Products without warehouse assignments:', totalProducts - productsWithWarehouses);

    // List all products with their warehouse assignments
    const allProducts = await Product.find().select('sku name warehouseStock').lean();
    console.log('\n=== ALL PRODUCTS ===');
    allProducts.forEach(product => {
      console.log(`\n${product.sku} - ${product.name}`);
      console.log('  Warehouse Stock:', product.warehouseStock?.length || 0, 'entries');
      if (product.warehouseStock && product.warehouseStock.length > 0) {
        product.warehouseStock.forEach(ws => {
          console.log(`    - Warehouse: ${ws.warehouse}, Qty: ${ws.quantity}`);
        });
      }
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProduct();
