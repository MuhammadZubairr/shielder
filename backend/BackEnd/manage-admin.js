import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import { USER_ROLES } from './config/constants.js';
import logger from './utils/logger.js';
import readline from 'readline';

/**
 * Admin Management Script
 * Allows you to update or recreate admin user
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const updateAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    console.log('\n🔧 Admin Account Management\n');
    console.log('Choose an option:');
    console.log('1. Update existing admin password');
    console.log('2. Delete and recreate admin account');
    console.log('3. Create a new admin account (different email)');
    console.log('4. View current admin accounts\n');

    const choice = await question('Enter your choice (1-4): ');

    switch (choice) {
      case '1':
        await updateAdminPassword();
        break;
      case '2':
        await recreateAdmin();
        break;
      case '3':
        await createNewAdmin();
        break;
      case '4':
        await viewAdmins();
        break;
      default:
        console.log('❌ Invalid choice');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error managing admin:', error);
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Update existing admin password
const updateAdminPassword = async () => {
  const email = await question('\nEnter admin email: ');
  const newPassword = await question('Enter new password: ');

  const admin = await User.findOne({ email, role: USER_ROLES.ADMIN });

  if (!admin) {
    console.log('\n❌ Admin user not found with that email');
    return;
  }

  admin.password = newPassword; // Will be hashed automatically
  await admin.save();

  console.log('\n✅ Admin password updated successfully!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 New Password: ${newPassword}`);
};

// Delete and recreate admin
const recreateAdmin = async () => {
  console.log('\n⚠️  This will delete the existing admin and create a new one');
  const confirm = await question('Are you sure? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Operation cancelled');
    return;
  }

  const oldEmail = await question('\nEnter existing admin email to delete: ');
  const newName = await question('Enter new admin name: ');
  const newEmail = await question('Enter new admin email: ');
  const newPassword = await question('Enter new admin password: ');
  const newPhone = await question('Enter new admin phone (optional): ');

  // Delete old admin
  const deleted = await User.findOneAndDelete({ email: oldEmail, role: USER_ROLES.ADMIN });

  if (deleted) {
    console.log(`\n✅ Deleted admin: ${oldEmail}`);
  }

  // Create new admin
  const newAdmin = new User({
    name: newName,
    email: newEmail,
    password: newPassword,
    role: USER_ROLES.ADMIN,
    phone: newPhone || undefined,
    department: 'Administration',
  });

  await newAdmin.save();

  console.log('\n✅ New admin created successfully!');
  console.log(`👤 Name: ${newName}`);
  console.log(`📧 Email: ${newEmail}`);
  console.log(`🔑 Password: ${newPassword}`);
  if (newPhone) console.log(`📱 Phone: ${newPhone}`);
};

// Create a new admin account
const createNewAdmin = async () => {
  const name = await question('\nEnter admin name: ');
  const email = await question('Enter admin email: ');
  const password = await question('Enter admin password: ');
  const phone = await question('Enter admin phone (optional): ');

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('\n❌ User with this email already exists');
    return;
  }

  // Create new admin
  const newAdmin = new User({
    name,
    email,
    password,
    role: USER_ROLES.ADMIN,
    phone: phone || undefined,
    department: 'Administration',
  });

  await newAdmin.save();

  console.log('\n✅ Admin created successfully!');
  console.log(`👤 Name: ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  if (phone) console.log(`📱 Phone: ${phone}`);
};

// View all admin accounts
const viewAdmins = async () => {
  const admins = await User.find({ role: USER_ROLES.ADMIN }).select('-password');

  console.log('\n📋 Current Admin Accounts:\n');

  if (admins.length === 0) {
    console.log('No admin accounts found');
    return;
  }

  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.name}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   📱 Phone: ${admin.phone || 'N/A'}`);
    console.log(`   🏢 Department: ${admin.department || 'N/A'}`);
    console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
    console.log('');
  });
};

// Run the script
updateAdmin();
