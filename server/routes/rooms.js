const express = require('express');
const multer = require('multer');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const notificationService = require('../services/realTimeNotificationService');
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Utility function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'RoomRento',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

const upload = multer({ storage });

// Add Room
router.post('/', auth, upload.array('images', 10), async (req, res) => {
    try {
        const images = req.files.map(file => file.path);

        // Safely convert latitude & longitude to Number
        const room = new Room({
            ...req.body,
            latitude: parseFloat(req.body.latitude) || 0,
            longitude: parseFloat(req.body.longitude) || 0,
            images,
            user: req.user.id,
        });

        await room.save();

        // Send notification to relevant users about new property (city-based)
        try {
            await notificationService.sendNewPropertyNotification({
                propertyId: room._id,
                propertyType: 'room',
                title: room.title,
                ownerId: req.user.id,
                city: room.city || req.body.city || ''
            });
        } catch (notificationError) {
            console.error('Error sending new property notification:', notificationError);
            // Don't fail the room creation if notification fails
        }

        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message || "Server Error" });
    }
});

// Get All Rooms with smart fallback and enhanced filtering
router.get('/', async (req, res) => {
    try {
        const { type, city, lat, lng, nearby, location, roomType, budget, roomCategory } = req.query;
        
        // Build query filter
        let filter = {};
        
        // Only show visible rooms (exclude explicitly hidden ones)
        filter.isVisible = { $ne: false };
        
        // Filter by type (Room, Hotel, Shop)
        if (type) {
            filter.type = type;
        }
        
        // Filter by city if provided
        if (city) {
            filter.city = new RegExp(city, 'i'); // Case insensitive search
        }
        
        // Filter by location if provided (broader search)
        if (location && !city) {
            filter.$or = [
                { city: new RegExp(location, 'i') },
                { location: new RegExp(location, 'i') },
                { address: new RegExp(location, 'i') }
            ];
        }
        
        // Try to fetch from database first
        let rooms = await Room.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 });
        
        // Handle nearby search with coordinates
        if (nearby === 'true' && lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            
            if (!isNaN(userLat) && !isNaN(userLng)) {
                // Calculate distance for each room and sort by proximity
                rooms = rooms.filter(room => {
                    if (!room.latitude || !room.longitude) return false;
                    
                    const distance = calculateDistance(
                        userLat, userLng, 
                        parseFloat(room.latitude), parseFloat(room.longitude)
                    );
                    
                    // Include rooms within 10km radius
                    return distance <= 10;
                }).sort((a, b) => {
                    const distanceA = calculateDistance(
                        userLat, userLng, 
                        parseFloat(a.latitude), parseFloat(a.longitude)
                    );
                    const distanceB = calculateDistance(
                        userLat, userLng, 
                        parseFloat(b.latitude), parseFloat(b.longitude)
                    );
                    return distanceA - distanceB;
                });
            }
        }
        
        return res.json(rooms);
        
    } catch (err) {
        console.error('Main error:', err);
        res.status(500).json({ 
            error: "Failed to fetch rooms", 
            message: err.message
        });
    }
});

// Get My Listings - Clean database version
router.get('/my-listings', auth, async (req, res) => {
    try {
        const rooms = await Room.find({ user: req.user.id })
            .populate('user', 'name email phone isVerified emailVerified phoneVerified')
            .sort({ createdAt: -1 });
        res.json(rooms);
    } catch (err) {
        console.error('Error fetching user listings:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Room By ID - Clean database version
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const room = await Room.findById(id)
            .populate('user', 'name email phone isVerified emailVerified phoneVerified')
            .populate('reviews.user', 'name');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json(room);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Room Visibility
router.patch('/:id/toggle-visibility', auth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Check if user owns this room
        if (room.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        room.isVisible = !room.isVisible;
        await room.save();
        
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Room
router.delete('/:id', auth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Check if user owns this room
        if (room.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Review to Room
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Validate comment
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ error: 'Comment is required' });
        }
        
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Check if user has completed booking for this room
        const Booking = require('../models/Booking');
        const completedBooking = await Booking.findOne({
            room: req.params.id,
            renter: req.user.id,
            status: 'completed'
        });
        
        if (!completedBooking) {
            return res.status(403).json({ error: 'You can only review rooms you have completed bookings for' });
        }
        
        // Check if user already reviewed this room
        const existingReview = room.reviews.find(review => review.user.toString() === req.user.id);
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this room' });
        }
        
        // Add review
        const newReview = {
            user: req.user.id,
            rating: parseInt(rating),
            comment: comment.trim()
        };
        
        room.reviews.push(newReview);
        room.calculateAverageRating();
        await room.save();
        
        // Populate the new review with user data
        await room.populate('reviews.user', 'name');
        
        res.status(201).json({
            message: 'Review added successfully',
            review: room.reviews[room.reviews.length - 1],
            averageRating: room.averageRating
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Reviews for a Room
router.get('/:id/reviews', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('reviews.user', 'name')
            .select('reviews averageRating');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json({
            reviews: room.reviews,
            averageRating: room.averageRating,
            totalReviews: room.reviews.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
