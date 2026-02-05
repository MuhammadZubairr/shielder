/**
 * Script to update existing products with warehouse stock
 * This adds warehouse assignments to products that were created before the feature
 */

import mongoose from 'mongoose';
import Product from './models/Product.js';
import Warehouse from './models/Warehouse.js';
import dotenv from 'dotenv';

dotenv.config();

const updateProductQuantities = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products with quantity 0 or empty warehouseStock
    const products = await Product.find({
      $or: [
        { quantity: 0 },
        { warehouseStock: { $size: 0 } }
      ]
    });

    console.log(`\n📦 Found ${products.length} products to update\n`);

    // Get the first warehouse to assign products to
    const warehouse = await Warehouse.findOne();
    
    if (!warehouse) {
      console.log('❌ No warehouse found. Please create a warehouse first.');
      process.exit(1);
    }

    console.log(`📍 Will assign products to warehouse: ${warehouse.name} (${warehouse.code})\n`);

    for (const product of products) {
      console.log(`\n🔧 Updating: ${product.name} (SKU: ${product.sku})`);
      console.log(`   Current quantity: ${product.quantity}`);
      console.log(`   Current warehouseStock: ${product.warehouseStock.length} entries`);

      // Ask what quantity to set (you can modify this default value)
      const defaultQuantity = 100; // Default quantity to assign

      // Check if this product already has this warehouse
      const hasWarehouse = product.warehouseStock.some(
        ws => ws.warehouse.toString() === warehouse._id.toString()
      );

      if (!hasWarehouse) {
        // Add warehouse stock
        product.warehouseStock.push({
          warehouse: warehouse._id,
          quantity: defaultQuantity,
          minStockLevel: product.minStockLevel || 10,
          location: 'Default Location',
          lastRestocked: new Date()
        });

        // Update the main quantity field to match total warehouse stock
        product.quantity = product.warehouseStock.reduce((sum, ws) => sum + ws.quantity, 0);

        await product.save();
        console.log(`   ✅ Updated! New quantity: ${product.quantity}`);
      } else {
        // Update existing warehouse stock quantity
        const warehouseStock = product.warehouseStock.find(
          ws => ws.warehouse.toString() === warehouse._id.toString()
        );
        
        if (warehouseStock.quantity === 0) {
          warehouseStock.quantity = defaultQuantity;
          warehouseStock.lastRestocked = new Date();
          
          // Update the main quantity field
          product.quantity = product.warehouseStock.reduce((sum, ws) => sum + ws.quantity, 0);
          
          await product.save();
          console.log(`   ✅ Updated warehouse stock! New quantity: ${product.quantity}`);
        } else {
          console.log(`   ℹ️  Product already has stock in this warehouse: ${warehouseStock.quantity}`);
        }
      }
    }

    console.log('\n\n✅ All products updated successfully!');
    console.log('\n📊 Summary:');
    const updatedProducts = await Product.find();
    const totalQuantity = updatedProducts.reduce((sum, p) => sum + p.quantity, 0);
    console.log(`   Total Products: ${updatedProducts.length}`);
    console.log(`   Total Quantity: ${totalQuantity}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductQuantities();
