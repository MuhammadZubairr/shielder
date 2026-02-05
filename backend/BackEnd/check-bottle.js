import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

async function checkBottle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const bottle = await Product.findById('697b5404da2bf4f4851d5033');
    
    if (bottle) {
      console.log('📦 Product Details:');
      console.log(`   Name: ${bottle.name}`);
      console.log(`   SKU: ${bottle.sku}`);
      console.log(`   Quantity: ${bottle.quantity}`);
      console.log(`   Min Stock Level: ${bottle.minStockLevel}`);
      console.log(`   Status: ${bottle.status}`);
      console.log(`   Unit Price: ${bottle.unitPrice}`);
    } else {
      console.log('❌ Product not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBottle();
