const express = require('express');
const Notification = require('../models/Notification');
const notificationService = require('../services/realTimeNotificationService');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all notifications for a user with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await notificationService.getUserNotifications(
      req.user.id, 
      parseInt(page), 
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get unread count' 
    });
  }
});

// Mark notifications as read
router.patch('/mark-read', auth, async (req, res) => {
  try {
    const { notificationIds = [] } = req.body;
    
    const result = await notificationService.markNotificationsAsRead(
      req.user.id, 
      notificationIds
    );

    res.json({
      success: true,
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notifications as read' 
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await notificationService.markNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read' 
    });
  }
});

// Delete a specific notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const result = await notificationService.deleteNotification(
      req.user.id, 
      notificationId
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification' 
    });
  }
});

// Clear all notifications
router.delete('/', auth, async (req, res) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user.id);

    res.json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear notifications' 
    });
  }
});

// Admin route: Send system-wide announcement
router.post('/admin/announcement', auth, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { title, content, priority = 'high', link = null } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    const notifications = await notificationService.sendAdminAnnouncement({
      title,
      content,
      priority,
      link
    });

    res.json({
      success: true,
      message: 'Announcement sent to all users',
      notificationCount: notifications.length
    });
  } catch (error) {
    console.error('Send admin announcement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send announcement' 
    });
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
