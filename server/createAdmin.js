const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    let adminUser = await User.findOne({ email: 'admin@roomrento.com' });
    
    if (adminUser) {
      console.log('👤 Admin user found, updating role...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Admin role updated');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@roomrento.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91-8929082629',
        isVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }
    
    console.log('📋 Admin Details:', {
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
      phone: adminUser.phone
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
};

createAdminUser();
