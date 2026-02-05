import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import { USER_ROLES } from './config/constants.js';
import logger from './utils/logger.js';

/**
 * Single Admin Setup Script
 * Removes all existing admins and creates only one admin user
 */

const setupSingleAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    console.log('\n🔧 Setting up single admin account...\n');

    // Delete ALL existing admin users
    const deleteResult = await User.deleteMany({ role: USER_ROLES.ADMIN });
    
    if (deleteResult.deletedCount > 0) {
      console.log(`✅ Removed ${deleteResult.deletedCount} existing admin(s)`);
    } else {
      console.log('ℹ️  No existing admin accounts found');
    }

    // Create the ONE admin user
    const adminUser = new User({
      name: 'Muhammad Zubair',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: USER_ROLES.ADMIN,
      phone: '+1234567890',
      department: 'Administration',
    });

    await adminUser.save();

    console.log('\n✅ Single admin account created successfully!\n');
    console.log('👤 Name: Muhammad Zubair');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('📱 Phone: +1234567890');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
    console.log('ℹ️  Only ONE admin account exists in the system now.\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error setting up admin:', error);
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the setup
setupSingleAdmin();
