const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const hotelRoutes = require('./routes/hotels');
const shopRoutes = require('./routes/shops');

const app = express();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Enhanced CORS Setup for Local, Vercel, and Render
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://room-rento.vercel.app',
  'https://room-rento-1zih.vercel.app',
  'https://roomrento.vercel.app',
  'https://roomrento-frontend.vercel.app',
  'https://roomrento-client.vercel.app',
  'https://roomrento.onrender.com',
  'https://roomrento-server.onrender.com',
  'https://roomrento-api.onrender.com'
];

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

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('RoomRento Backend is running');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
