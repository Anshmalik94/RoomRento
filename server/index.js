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

const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const hotelRoutes = require('./routes/hotels');
const shopRoutes = require('./routes/shops');
const notificationRoutes = require('./routes/notifications');
const helpRoutes = require('./routes/help');
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
  'https://roomrento.com' // Add deployed frontend domain
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
      
      // Check if origin is in allowed list or matches patterns
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) || // Allow all Vercel preview URLs
        /\.onrender\.com$/.test(origin) || // Allow all Render URLs
        /localhost:\d+$/.test(origin) // Allow all localhost ports
      ) {
        return callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB Connection with proper error handling
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Running with limited functionality - some features may not work');
  });

// ✅ Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/help', helpRoutes);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('RoomRento Backend is running');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time notifications`);
});
