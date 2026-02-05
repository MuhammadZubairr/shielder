import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Warehouse from './models/Warehouse.js';

dotenv.config();

/**
 * Fix Product Quantities
 * Recalculates global product.quantity based on sum of warehouseStock quantities
 */
async function fixProductQuantities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({}).populate('warehouseStock.warehouse', 'name');
    
    console.log(`📦 Found ${products.length} products to check\n`);
    console.log('='.repeat(80));

    let fixedCount = 0;
    let inconsistencies = [];

    for (const product of products) {
      // Calculate total from warehouse stocks
      const calculatedTotal = product.warehouseStock.reduce((total, ws) => total + (ws.quantity || 0), 0);
      
      // Check if it matches the stored quantity
      if (product.quantity !== calculatedTotal) {
        inconsistencies.push({
          name: product.name,
          sku: product.sku,
          storedQuantity: product.quantity,
          calculatedQuantity: calculatedTotal,
          difference: calculatedTotal - product.quantity,
          warehouses: product.warehouseStock.map(ws => ({
            warehouse: ws.warehouse?.name || 'Unknown',
            quantity: ws.quantity
          }))
        });

        // Fix the quantity
        product.quantity = calculatedTotal;
        
        // Update status based on new quantity
        if (product.quantity === 0) {
          product.status = 'out_of_stock';
        } else if (product.quantity <= product.minStockLevel) {
          product.status = 'low_stock';
        } else {
          product.status = 'available';
        }
        
        await product.save();
        fixedCount++;
      }
    }

    console.log('\n📊 RESULTS:');
    console.log('='.repeat(80));
    console.log(`Total products checked: ${products.length}`);
    console.log(`Products fixed: ${fixedCount}`);
    console.log(`Products correct: ${products.length - fixedCount}`);
    
    if (inconsistencies.length > 0) {
      console.log('\n⚠️  INCONSISTENCIES FOUND AND FIXED:');
      console.log('='.repeat(80));
      
      inconsistencies.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name} (SKU: ${item.sku})`);
        console.log(`   Stored Quantity: ${item.storedQuantity}`);
        console.log(`   Calculated Total: ${item.calculatedQuantity}`);
        console.log(`   Difference: ${item.difference > 0 ? '+' : ''}${item.difference}`);
        console.log(`   Warehouse Breakdown:`);
        item.warehouses.forEach(wh => {
          console.log(`     - ${wh.warehouse}: ${wh.quantity}`);
        });
      });
    } else {
      console.log('\n✅ All product quantities are consistent!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Fix completed successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixProductQuantities();
