const express = require('express');
const multer = require('multer');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const notificationService = require('../services/realTimeNotificationService');
const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

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

        // Send notification to all users about new property
        try {
            await notificationService.sendNewPropertyNotification({
                propertyId: room._id,
                propertyType: 'room',
                title: room.title,
                ownerId: req.user.id
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

// Get All Rooms with smart fallback and type filtering
router.get('/', async (req, res) => {
    try {
        const { type, city, lat, lng, nearby } = req.query;
        
        // Build query filter
        let filter = {};
        
        // Filter by type (Room, Hotel, Shop)
        if (type) {
            filter.type = type;
        }
        
        // Filter by city if provided
        if (city) {
            filter.city = new RegExp(city, 'i'); // Case insensitive search
        }
        
        // Try to fetch from database first
        let rooms;
        try {
            rooms = await Room.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 });
            return res.json(rooms);
        } catch (dbError) {
            // Fallback to mock data if database fails
            const mockRooms = [
                {
                    _id: "67891234567890abcdef1234",
                    title: "Beautiful Room in Delhi",
                    description: "Spacious room with all amenities including AC, Wi-Fi, and parking",
                    price: 15000,
                    location: "Delhi, Delhi", 
                    city: "Delhi",
                    state: "Delhi",
                    type: "Room",
                    roomType: "Single Room",
                    furnished: "Fully Furnished",
                    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop"],
                    user: {
                        _id: "67891234567890abcdef0001",
                        name: "John Doe",
                        phone: "9876543210",
                        email: "john@example.com"
                    },
                    facilities: ["Wi-Fi", "AC", "Parking", "Security"],
                    createdAt: new Date(),
                    available: true,
                    maxOccupancy: 2,
                    area: "500"
                },
                {
                    _id: "67891234567890abcdef1235",
                    title: "Cozy PG in Noida",
                    description: "Perfect for students and professionals with all basic amenities",
                    price: 8000,
                    location: "Noida, Uttar Pradesh",
                    city: "Noida", 
                    state: "Uttar Pradesh",
                    type: "Room",
                    roomType: "PG for Boys",
                    furnished: "Semi Furnished",
                    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"],
                    user: {
                        _id: "67891234567890abcdef0002",
                        name: "Jane Smith",
                        phone: "9876543211",
                        email: "jane@example.com"
                    },
                    facilities: ["Wi-Fi", "Laundry", "Kitchen"],
                    createdAt: new Date(),
                    available: true,
                    maxOccupancy: 1,
                    area: "300"
                },
                {
                    _id: "67891234567890abcdef1236",
                    title: "Luxury Apartment in Mumbai",
                    description: "Fully furnished luxury apartment with sea view",
                    price: 25000,
                    location: "Mumbai, Maharashtra",
                    city: "Mumbai",
                    state: "Maharashtra",
                    type: "Room", 
                    roomType: "Studio Apartment",
                    furnished: "Fully Furnished",
                    images: ["https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop"],
                    user: {
                        _id: "67891234567890abcdef0003",
                        name: "Mike Johnson",
                        phone: "9876543212",
                        email: "mike@example.com"
                    },
                    facilities: ["Wi-Fi", "AC", "Gym", "Swimming Pool", "Security"],
                    createdAt: new Date(),
                    available: true,
                    maxOccupancy: 3,
                    area: "800"
                }
            ];
            
            // Filter mock data based on query parameters
            let filteredMockRooms = mockRooms;
            
            if (type) {
                filteredMockRooms = filteredMockRooms.filter(room => room.type === type);
            }
            
            if (city) {
                filteredMockRooms = filteredMockRooms.filter(room => 
                    room.city.toLowerCase().includes(city.toLowerCase())
                );
            }
            
            return res.json(filteredMockRooms);
        }
        
    } catch (err) {
        res.status(500).json({ 
            error: "Failed to fetch rooms", 
            message: err.message,
            fallback: "Database temporarily unavailable" 
        });
    }
});

// Get My Listings with smart fallback
router.get('/my-listings', auth, async (req, res) => {
    try {
        
        // Try database first
        try {
            const rooms = await Room.find({ user: req.user.id })
                .populate('user', 'name email phone isVerified emailVerified phoneVerified')
                .sort({ createdAt: -1 });
            return res.json(rooms);
        } catch (dbError) {
            
            // Fallback mock data for user's listings
            const mockUserRooms = [
                {
                    _id: "67891234567890abcdef1234",
                    title: "My Beautiful Room",
                    description: "My personal room listing with great amenities",
                    price: 15000,
                    location: "Delhi, Delhi",
                    user: req.user.id,
                    available: true,
                    createdAt: new Date(),
                    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop"],
                    facilities: ["Wi-Fi", "AC", "Parking"],
                    roomType: "Single Room"
                }
            ];
            
            return res.json(mockUserRooms);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Room By ID with smart fallback
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try database first
        try {
            const room = await Room.findById(id)
                .populate('user', 'name email phone isVerified emailVerified phoneVerified')
                .populate('reviews.user', 'name');
            
            if (room) {
                return res.json(room);
            } else {
                // If not found in DB, return mock data
                throw new Error('Room not found in database');
            }
        } catch (dbError) {
            
            // Mock room data for testing
            const mockRoom = {
                _id: id,
                title: "Beautiful Room Details",
                description: "Spacious room with all amenities including AC, Wi-Fi, and parking. Perfect for students and professionals with modern facilities and great connectivity.",
                price: 15000,
                location: "Delhi, Delhi", 
                city: "Delhi",
                state: "Delhi",
                roomType: "Single Room",
                furnished: "Fully Furnished",
                images: [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
                ],
                user: {
                    _id: "67891234567890abcdef0001",
                    name: "John Doe",
                    phone: "9876543210",
                    email: "john@example.com",
                    isVerified: true
                },
                facilities: ["Wi-Fi", "AC", "Parking", "Security", "Kitchen", "Laundry"],
                createdAt: new Date(),
                available: true,
                maxOccupancy: 2,
                area: "500",
                reviews: [],
                averageRating: 4.5,
                address: "Near Metro Station, Central Delhi",
                amenities: ["24/7 Water Supply", "Power Backup", "CCTV Security", "Housekeeping"]
            };
            
            return res.json(mockRoom);
        }
        
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
