/**
 * Update all products' status based on their current quantity
 */

import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const updateProductStatus = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find();
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;
    for (const product of products) {
      const oldStatus = product.status;
      
      // Let the pre-save hook update the status
      await product.save();
      
      if (product.status !== oldStatus) {
        updated++;
        console.log(`✅ ${product.name} (${product.sku})`);
        console.log(`   Quantity: ${product.quantity}, Min: ${product.minStockLevel}`);
        console.log(`   Status: ${oldStatus} → ${product.status}\n`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Already Correct: ${products.length - updated}`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductStatus();
