import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const productId = '697b5404da2bf4f4851d5033';
    
    console.log('📦 Before Update:');
    let product = await Product.findById(productId);
    console.log(`   Quantity: ${product.quantity}`);
    console.log(`   Status: ${product.status}\n`);

    // Test update with findByIdAndUpdate (like the API does)
    console.log('🔄 Updating with findByIdAndUpdate...');
    const updated = await Product.findByIdAndUpdate(
      productId,
      { quantity: 20, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    console.log('📦 After Update:');
    console.log(`   Quantity: ${updated.quantity}`);
    console.log(`   Status: ${updated.status}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testUpdate();
