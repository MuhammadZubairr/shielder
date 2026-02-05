import mongoose from 'mongoose';
import Supplier from './models/Supplier.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSuppliers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get ALL suppliers
    const allSuppliers = await Supplier.find({});
    console.log('\n📦 ALL SUPPLIERS IN DATABASE:');
    console.log('Total count:', allSuppliers.length);
    allSuppliers.forEach(s => {
      console.log(`  - ${s.name}: status="${s.status}", isActive=${s.isActive}`);
    });

    // Get suppliers with status='active'
    const activeSuppliers = await Supplier.find({ status: 'active' });
    console.log('\n✅ SUPPLIERS WITH status="active":');
    console.log('Count:', activeSuppliers.length);
    activeSuppliers.forEach(s => {
      console.log(`  - ${s.name}: status="${s.status}"`);
    });

    // Get suppliers with isActive=true
    const isActiveSuppliers = await Supplier.find({ isActive: true });
    console.log('\n⚠️  SUPPLIERS WITH isActive=true:');
    console.log('Count:', isActiveSuppliers.length);
    isActiveSuppliers.forEach(s => {
      console.log(`  - ${s.name}: isActive=${s.isActive}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSuppliers();
