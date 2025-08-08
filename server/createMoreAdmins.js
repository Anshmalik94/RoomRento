const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdminUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const adminUsers = [
      {
        name: 'Ajeet Kumar',
        email: 'ajeetkumar97111@gmail.com',
        password: 'admin123',
        phone: '+91-8929082629'
      },
      {
        name: 'Natik Kumar', 
        email: 'Natikkumar1111@gmail.com',
        password: 'admin123',
        phone: '+91-8929082629'
      }
    ];

    for (const adminData of adminUsers) {
      let existingUser = await User.findOne({ email: adminData.email });
      
      if (existingUser) {
        console.log(`👤 User ${adminData.email} found, updating to admin role...`);
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ ${adminData.email} updated to admin`);
      } else {
        console.log(`👤 Creating new admin user: ${adminData.email}...`);
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        const newAdmin = new User({
          name: adminData.name,
          email: adminData.email,
          password: hashedPassword,
          role: 'admin',
          phone: adminData.phone,
          isVerified: true,
          emailVerified: true,
          phoneVerified: true
        });
        
        await newAdmin.save();
        console.log(`✅ Admin user ${adminData.email} created successfully`);
      }
    }
    
    console.log('🎉 All admin users processed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
};

createAdminUsers();
