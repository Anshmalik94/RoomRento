const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Shop = require('../models/Shop');
const Booking = require('../models/Booking');
const SupportRequest = require('../models/SupportRequest');
const HelpTopic = require('../models/HelpTopic');
const router = express.Router();

// Admin middleware to check if user has admin access
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Dashboard stats
router.get('/dashboard/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      roomCount,
      hotelCount,
      shopCount,
      totalBookings,
      totalRevenue,
      recentUsers,
      recentBookings,
      monthlyStats
    ] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Hotel.countDocuments(),
      Shop.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5),
      Booking.find().populate('renter', 'name email').sort({ createdAt: -1 }).limit(5),
      getMonthlyStats()
    ]);

    res.json({
      totalUsers,
      totalProperties: roomCount + hotelCount + shopCount,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentUsers,
      recentBookings,
      monthlyStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Recent bookings for dashboard
router.get('/dashboard/recent-bookings', auth, adminAuth, async (req, res) => {
  try {
    const recentBookings = await Booking.find()
      .populate('renter', 'name email')
      .populate('room', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentBookings || []);
  } catch (error) {
    console.error('Recent bookings error:', error);
    res.json([]); // Return empty array as fallback
  }
});

// Recent users for dashboard
router.get('/dashboard/recent-users', auth, adminAuth, async (req, res) => {
  try {
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentUsers || []);
  } catch (error) {
    console.error('Recent users error:', error);
    res.json([]); // Return empty array as fallback
  }
});

// User management
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Update user status
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Update user password
router.put('/users/:id/password', auth, adminAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ message: 'Failed to update user password' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Booking management
router.get('/bookings', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const search = req.query.search || '';

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'renter.name': { $regex: search, $options: 'i' } },
        { 'renter.email': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('renter', 'name email')
      .populate('room', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.put('/bookings/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('renter', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Update booking
router.put('/bookings/:id', auth, adminAuth, async (req, res) => {
  try {
    const { checkIn, checkOut, totalAmount, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { checkIn, checkOut, totalAmount, status, updatedAt: new Date() },
      { new: true }
    ).populate('renter', 'name email').populate('room', 'title');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/bookings/:id', auth, adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

// Property management
router.get('/properties', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';
    const search = req.query.search || '';

    let properties = [];
    let total = 0;

    if (type === 'rooms' || !type) {
      const rooms = await Room.find(search ? { title: { $regex: search, $options: 'i' } } : {})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      properties = [...properties, ...rooms.map(r => ({ ...r.toObject(), type: 'room', owner: r.user }))];
    }

    if (type === 'hotels' || !type) {
      const hotels = await Hotel.find(search ? { title: { $regex: search, $options: 'i' } } : {})
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      properties = [...properties, ...hotels.map(h => ({ ...h.toObject(), type: 'hotel' }))];
    }

    if (type === 'shops' || !type) {
      const shops = await Shop.find(search ? { title: { $regex: search, $options: 'i' } } : {})
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      properties = [...properties, ...shops.map(s => ({ ...s.toObject(), type: 'shop' }))];
    }

    // Sort by creation date
    properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    total = properties.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    properties = properties.slice(startIndex, endIndex);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Update property status
router.put('/properties/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const propertyId = req.params.id;

    // Try to update in rooms, hotels, and shops collections
    let updatedProperty = null;
    
    // Try Room first
    updatedProperty = await Room.findByIdAndUpdate(
      propertyId,
      { status: status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedProperty) {
      // Try Hotel
      updatedProperty = await Hotel.findByIdAndUpdate(
        propertyId,
        { status: status, updatedAt: new Date() },
        { new: true }
      );
    }

    if (!updatedProperty) {
      // Try Shop
      updatedProperty = await Shop.findByIdAndUpdate(
        propertyId,
        { status: status, updatedAt: new Date() },
        { new: true }
      );
    }

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json({ message: 'Failed to update property status' });
  }
});

// Update property
router.put('/properties/:id', auth, adminAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Try to update in rooms, hotels, and shops collections
    let updatedProperty = null;
    
    // Try Room first
    updatedProperty = await Room.findByIdAndUpdate(
      propertyId,
      updateData,
      { new: true }
    ).populate('user', 'name email phone');

    if (!updatedProperty) {
      // Try Hotel
      updatedProperty = await Hotel.findByIdAndUpdate(
        propertyId,
        updateData,
        { new: true }
      ).populate('user', 'name email phone');
    }

    if (!updatedProperty) {
      // Try Shop
      updatedProperty = await Shop.findByIdAndUpdate(
        propertyId,
        updateData,
        { new: true }
      ).populate('user', 'name email phone');
    }

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Failed to update property' });
  }
});

// Delete property
router.delete('/properties/:id', auth, adminAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    let deletedProperty = null;

    // Try to delete from rooms, hotels, and shops collections
    deletedProperty = await Room.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      deletedProperty = await Hotel.findByIdAndDelete(propertyId);
    }

    if (!deletedProperty) {
      deletedProperty = await Shop.findByIdAndDelete(propertyId);
    }

    if (!deletedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

// Analytics data
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const [
      userGrowth,
      revenueData,
      bookingTrends,
      propertyDistribution
    ] = await Promise.all([
      getUserGrowthData(),
      getRevenueData(),
      getBookingTrends(),
      getPropertyDistribution()
    ]);

    res.json({
      userGrowth,
      revenueData,
      bookingTrends,
      propertyDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

// Support requests management
router.get('/support-requests', auth, adminAuth, async (req, res) => {
  try {
    const requests = await SupportRequest.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get support requests error:', error);
    res.status(500).json({ message: 'Failed to fetch support requests' });
  }
});

// Helper functions for analytics
async function getMonthlyStats() {
  const currentDate = new Date();
  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
  
  const monthlyData = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: 'confirmed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return monthlyData;
}

async function getUserGrowthData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await User.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
}

async function getRevenueData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: 'confirmed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
}

async function getBookingTrends() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        bookings: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
}

async function getPropertyDistribution() {
  const [rooms, hotels, shops] = await Promise.all([
    Room.countDocuments(),
    Hotel.countDocuments(),
    Shop.countDocuments()
  ]);

  return {
    rooms,
    hotels,
    shops
  };
}

module.exports = router;
