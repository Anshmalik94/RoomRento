const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Hotel = require('../models/Hotel');
const auth = require('../middleware/auth');
const notificationService = require('../services/realTimeNotificationService');
const mongoose = require('mongoose');

const router = express.Router();

// ✅ Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ✅ GET all hotels with filters
router.get('/', async (req, res) => {
  try {
    const {
      location,
      category,
      minPrice,
      maxPrice,
      amenities,
      roomTypes,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $in: amenitiesArray };
    }
    
    if (roomTypes) {
      const roomTypesArray = roomTypes.split(',');
      filter.roomTypes = { $in: roomTypesArray };
    }

    const hotels = await Hotel.find(filter)
      .populate('owner', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Hotel.countDocuments(filter);

    res.json({
      hotels,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET single hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'name email contactNumber');
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ POST create new hotel (Protected route)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      location,
      latitude,
      longitude,
      amenities,
      rules,
      contactNumber,
      email,
      checkInTime,
      checkOutTime,
      totalRooms,
      roomTypes
    } = req.body;

    // Parse JSON strings
    const parsedAmenities = JSON.parse(amenities || '[]');
    const parsedRoomTypes = JSON.parse(roomTypes || '[]');

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'roomrento-hotels',
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto' }
            ]
          });
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
        }
      }
    }

    const hotel = new Hotel({
      title,
      description,
      type: 'Hotel',
      category,
      price: Number(price),
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      amenities: parsedAmenities,
      rules,
      contactNumber,
      email,
      checkInTime,
      checkOutTime,
      totalRooms: Number(totalRooms),
      roomTypes: parsedRoomTypes,
      images: imageUrls,
      owner: req.user.id
    });

    await hotel.save();
    
    // Send notification to all users about new hotel
    await notificationService.sendNewPropertyNotification(
      'Hotel',
      hotel.title,
      hotel._id
    );
    
    const populatedHotel = await Hotel.findById(hotel._id)
      .populate('owner', 'name email');

    res.status(201).json({
      message: 'Hotel listed successfully',
      hotel: populatedHotel
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ PUT update hotel (Protected route)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // Check if user owns this hotel
    if (hotel.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      category,
      price,
      location,
      latitude,
      longitude,
      amenities,
      rules,
      contactNumber,
      email,
      checkInTime,
      checkOutTime,
      totalRooms,
      roomTypes
    } = req.body;

    // Parse JSON strings
    const parsedAmenities = JSON.parse(amenities || '[]');
    const parsedRoomTypes = JSON.parse(roomTypes || '[]');

    // Handle new image uploads
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'roomrento-hotels',
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto' }
            ]
          });
          newImageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
        }
      }
    }

    // Update hotel data
    const updatedData = {
      title,
      description,
      category,
      price: Number(price),
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      amenities: parsedAmenities,
      rules,
      contactNumber,
      email,
      checkInTime,
      checkOutTime,
      totalRooms: Number(totalRooms),
      roomTypes: parsedRoomTypes,
      updatedAt: new Date()
    };

    // Add new images if any
    if (newImageUrls.length > 0) {
      updatedData.images = [...hotel.images, ...newImageUrls];
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ DELETE hotel (Protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // Check if user owns this hotel
    if (hotel.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete images from Cloudinary
    if (hotel.images && hotel.images.length > 0) {
      for (const imageUrl of hotel.images) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`roomrento-hotels/${publicId}`);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
    }

    await Hotel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET hotels by owner (Protected route)
router.get('/owner/my-hotels', auth, async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching owner hotels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ PATCH toggle visibility (Protected route)
router.patch('/:id/toggle-visibility', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    if (hotel.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    hotel.isVisible = !hotel.isVisible;
    await hotel.save();
    
    res.json({ 
      message: 'Hotel visibility updated successfully',
      isVisible: hotel.isVisible 
    });
  } catch (error) {
    console.error('Error toggling hotel visibility:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET hotels for the logged-in user
router.get('/my-listings', auth, async (req, res) => {
  try {
    console.log('Full req.user object:', req.user); // Debug log
    const userId = mongoose.Types.ObjectId(req.user._id); // Explicitly cast to ObjectId
    const hotels = await Hotel.find({ owner: userId });
    res.status(200).json(hotels);
  } catch (err) {
    console.error('Error fetching user hotels:', err);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

module.exports = router;
