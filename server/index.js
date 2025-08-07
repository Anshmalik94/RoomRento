const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

// Enable mongoose buffering to wait for connection
mongoose.set('bufferCommands', true);

const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const hotelRoutes = require('./routes/hotels');
const shopRoutes = require('./routes/shops');
const notificationRoutes = require('./routes/notifications');
const helpRoutes = require('./routes/help');
const adminRoutes = require('./routes/admin');
const notificationService = require('./services/realTimeNotificationService');

const app = express();
const server = http.createServer(app);

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Enhanced CORS Setup for Local, Vercel, Netlify, and Render
const allowedOrigins = [
  'http://localhost:3000',
  'https://roomrento.onrender.com',
  'https://roomrento-server.onrender.com',
  'https://roomrento-api.onrender.com',
  'https://roomrento.com', // Add deployed frontend domain
  'https://www.roomrento.com', // Add www version
  'https://roomrento.vercel.app', // Vercel deployment
  'https://roomrento.netlify.app' // Netlify deployment
];

// Socket.IO Setup with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set Socket.IO instance in notification service
notificationService.setSocketIO(io);

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle demo users differently
    if (decoded.id && decoded.id.startsWith('demo_')) {
      socket.userId = decoded.id;
      socket.userRole = decoded.role || 'renter';
      socket.userName = decoded.name || 'Demo User';
      socket.isDemo = true;
      return next();
    }
    
    const User = require('./models/User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired. Please login again.'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token format.'));
    }
    
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  
  // Join user-specific room for targeted notifications
  socket.join(`user_${socket.userId}`);
  
  // Send current unread count on connection
  notificationService.getUnreadCount(socket.userId).then(count => {
    socket.emit('notificationCountUpdated', count);
  });

  // Handle notification read
  socket.on('markNotificationAsRead', async (notificationIds) => {
    try {
      await notificationService.markNotificationsAsRead(socket.userId, notificationIds);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Handle getting notifications
  socket.on('getNotifications', async (data = {}) => {
    try {
      const { page = 1, limit = 20 } = data;
      const result = await notificationService.getUserNotifications(socket.userId, page, limit);
      socket.emit('notificationsReceived', result);
    } catch (error) {
      console.error('Error getting notifications:', error);
      socket.emit('notificationsError', { message: 'Failed to fetch notifications' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS check for origin:', origin);
      }
      
      // Check if origin is in allowed list or matches patterns
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) || // Allow all Vercel preview URLs
        /\.onrender\.com$/.test(origin) || // Allow all Render URLs
        /localhost:\d+$/.test(origin) || // Allow all localhost ports
        /\.netlify\.app$/.test(origin) // Allow all Netlify URLs
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('CORS allowed for:', origin);
        }
        return callback(null, true);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Blocked by CORS:', origin);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

// Add preflight handling for all routes
app.options('*', cors());

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || 
      /\.vercel\.app$/.test(origin) || 
      /\.onrender\.com$/.test(origin) || 
      /localhost:\d+$/.test(origin) ||
      /\.netlify\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  next();
});

// ✅ Middleware
app.use(express.json());

// ✅ Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB Connection with enhanced error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection timeout settings
      serverSelectionTimeoutMS: 30000, // Increased to 30s
      connectTimeoutMS: 30000,         // 30s to establish connection
      socketTimeoutMS: 0,              // Disable socket timeout (keep alive)
      
      // Additional stability options
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
      minPoolSize: 5,                  // Maintain minimum 5 socket connections
      maxIdleTimeMS: 30000,           // Close connections after 30 seconds of inactivity
      
      // Retry settings
      retryWrites: true,              // Enable retryable writes
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Connected to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    // Specific error handling
    if (error.name === 'MongoServerSelectionError') {
      console.log('🔍 Connection timeout - This could be due to:');
      console.log('   • Network connectivity issues');
      console.log('   • MongoDB Atlas IP whitelist restrictions');
      console.log('   • Incorrect connection string');
      console.log('   • MongoDB cluster is paused/down');
    }
    
    // Don't exit process immediately, let it retry
    console.log('⏳ Retrying connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

// Initialize database connection
connectDB();

// ✅ Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Health Check
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    message: 'RoomRento Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({
    status: 'OK',
    database: {
      status: statusMap[dbStatus] || 'Unknown',
      readyState: dbStatus
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time notifications`);
});
