import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import { USER_ROLES } from './config/constants.js';
import logger from './utils/logger.js';

/**
 * Seed Script - Creates default admin user
 * Run this script once to create the initial admin account
 */

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@university.edu' });
    
    if (existingAdmin) {
      logger.info('Admin user already exists!');
      logger.info(`Email: admin@university.edu`);
      console.log('\n✅ Admin user already exists!');
      console.log('📧 Email: admin@university.edu');
      console.log('🔑 Use your existing password or reset it if forgotten\n');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User', // Change this to your desired name
      email: 'admin@university.edu', // Change this to your desired email
      password: 'admin123', // Change this to your desired password (will be hashed automatically)
      role: USER_ROLES.ADMIN,
      phone: '+1234567890', // Change this to your phone number
      department: 'Administration', // Change department if needed
    });

    await adminUser.save();

    logger.info('Admin user created successfully!');
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email: admin@university.edu');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
