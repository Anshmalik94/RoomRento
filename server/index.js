const dotenv = require('dotenv');
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);  // Test ke liye lagayi hai

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const app = express();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Smart CORS Config
const allowedOrigins = [
    'http://localhost:3000',
    'https://room-rento-ni9n.vercel.app',
    'https://roomrento.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('CORS policy violation'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/rooms', roomRoutes);
app.use('/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('RoomRento Backend is running');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
