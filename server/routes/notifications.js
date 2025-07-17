const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, seen } = req.query;
    
    // Build filter
    let filter = { userId: req.user.id };
    if (seen !== undefined) {
      filter.seen = seen === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('relatedBookingId', 'checkInDate checkOutDate status totalAmount')
      .populate('relatedRoomId', 'title location price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      seen: false 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      seen: false 
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark notification as seen
router.patch('/:id/seen', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    notification.seen = true;
    await notification.save();

    res.json({ msg: 'Notification marked as seen' });
  } catch (error) {
    console.error('Mark seen error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark all notifications as seen
router.patch('/mark-all-seen', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, seen: false },
      { seen: true }
    );

    res.json({ msg: 'All notifications marked as seen' });
  } catch (error) {
    console.error('Mark all seen error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
