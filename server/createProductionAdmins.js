const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Production MongoDB connection
const MONGO_URI = "mongodb+srv://anshmalik1:8920664202@cluster0.fkgdv3l.mongodb.net/roomrento?retryWrites=true&w=majority&appName=Cluster0&connectTimeoutMS=30000&socketTimeoutMS=0&maxPoolSize=10";

// User schema with admin role
const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  role: { type: String, enum: ["renter", "owner", "admin"], default: "renter" },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  isVerified: { 
    type: Boolean, 
    default: false,
    get: function() {
      return this.emailVerified && this.phoneVerified;
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const User = mongoose.model("User", userSchema);

const createProductionAdmins = async () => {
  try {
    console.log('🔗 Connecting to Production MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to Production MongoDB');

    const adminUsers = [
      {
        name: 'Admin User',
        email: 'admin@roomrento.com',
        password: 'admin123',
        phone: '+91-8929082629'
      },
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
      // Delete existing user if any
      await User.deleteOne({ email: adminData.email });
      console.log(`🗑️  Deleted existing user: ${adminData.email}`);
      
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
      console.log(`✅ Created admin user: ${adminData.email}`);
    }
    
    console.log('🎉 All production admin users created successfully!');
    
    // Verify the users
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`📊 Total admin users in production: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Production Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Production database connection closed');
  }
};

createProductionAdmins();
