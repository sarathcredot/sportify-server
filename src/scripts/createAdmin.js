const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@sportifypro.com',
      role: ROLES.ADMIN 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@123', salt);

    // Create admin user
    const adminUser = new User({
      email: 'admin@sportifypro.com',
      password: hashedPassword,
      role: ROLES.ADMIN,
      fullName: 'System Admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser(); 