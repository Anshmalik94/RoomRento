
const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');
const notificationService = require('../services/realTimeNotificationService');

const router = express.Router();

// GET my shop listings (for owner)
router.get('/my-listings', auth, async (req, res) => {
  try {
    console.log('Fetching shops for owner:', req.user.id);
    const shops = await Shop.find({ owner: req.user.id })
      .populate('owner', 'name email contactNumber')
      .sort({ createdAt: -1 });
    console.log('Found shops:', shops);
    res.json(shops);
  } catch (error) {
    console.error('Error fetching my shop listings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

// ✅ GET all shops with filters
router.get('/', async (req, res) => {
  try {
    const {
      location,
      category,
      businessType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenities,
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
    
    if (businessType) {
      filter.businessType = businessType;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (minArea || maxArea) {
      filter.shopArea = {};
      if (minArea) filter.shopArea.$gte = Number(minArea);
      if (maxArea) filter.shopArea.$lte = Number(maxArea);
    }
    
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $in: amenitiesArray };
    }

    const shops = await Shop.find(filter)
      .populate('owner', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shop.countDocuments(filter);

    res.json({
      shops,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET single shop by ID
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'name email contactNumber');
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ POST create new shop (Protected route)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      businessType,
      price,
      location,
      latitude,
      longitude,
      amenities,
      rules,
      contactNumber,
      email,
      shopArea,
      openingHours,
      closingHours,
      parkingSpaces
    } = req.body;

    // Parse JSON strings
    const parsedAmenities = JSON.parse(amenities || '[]');

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'roomrento-shops',
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

    const shop = new Shop({
      title,
      description,
      type: 'Shop',
      category,
      businessType,
      price: Number(price),
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      amenities: parsedAmenities,
      rules,
      contactNumber,
      email,
      shopArea: Number(shopArea),
      openingHours,
      closingHours,
      parkingSpaces: parkingSpaces ? Number(parkingSpaces) : 0,
      images: imageUrls,
      // Always set owner from auth, never from frontend
      owner: req.user.id
    });

    await shop.save();
    

    // Send notification to all renters about new shop
    await notificationService.sendNewPropertyNotification({
      propertyId: shop._id,
      propertyType: 'shop',
      title: shop.title,
      ownerId: req.user.id,
      city: shop.location || ''
    });
    
    const populatedShop = await Shop.findById(shop._id)
      .populate('owner', 'name email');

    res.status(201).json({
      message: 'Shop listed successfully',
      shop: populatedShop
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ PUT update shop (Protected route)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    // Check if user owns this shop
    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      category,
      businessType,
      price,
      location,
      latitude,
      longitude,
      amenities,
      rules,
      contactNumber,
      email,
      shopArea,
      openingHours,
      closingHours,
      parkingSpaces
    } = req.body;

    // Parse JSON strings
    const parsedAmenities = JSON.parse(amenities || '[]');

    // Handle new image uploads
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'roomrento-shops',
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

    // Update shop data
    const updatedData = {
      title,
      description,
      category,
      businessType,
      price: Number(price),
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      amenities: parsedAmenities,
      rules,
      contactNumber,
      email,
      shopArea: Number(shopArea),
      openingHours,
      closingHours,
      parkingSpaces: parkingSpaces ? Number(parkingSpaces) : 0,
      updatedAt: new Date()
    };

    // Add new images if any
    if (newImageUrls.length > 0) {
      updatedData.images = [...shop.images, ...newImageUrls];
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Shop updated successfully',
      shop: updatedShop
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ DELETE shop (Protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    // Check if user owns this shop
    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete images from Cloudinary
    if (shop.images && shop.images.length > 0) {
      for (const imageUrl of shop.images) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`roomrento-shops/${publicId}`);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
    }

    await Shop.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET shops by owner (Protected route)
router.get('/owner/my-shops', auth, async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(shops);
  } catch (error) {
    console.error('Error fetching owner shops:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
