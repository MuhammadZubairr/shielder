import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function testProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get ALL products
    const allProducts = await Product.find({});
    console.log('\n📦 ALL PRODUCTS IN DATABASE:');
    console.log('Total count:', allProducts.length);
    allProducts.forEach(p => {
      console.log(`  - ${p.name} (SKU: ${p.sku}): status="${p.status}", quantity=${p.quantity}`);
    });

    // Get products with status='active'
    const activeProducts = await Product.find({ status: 'active' });
    console.log('\n✅ PRODUCTS WITH status="active":');
    console.log('Count:', activeProducts.length);
    activeProducts.forEach(p => {
      console.log(`  - ${p.name} (SKU: ${p.sku}): status="${p.status}", quantity=${p.quantity}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProducts();
