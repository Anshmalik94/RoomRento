const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: [
      'booking_request',      // When user sends booking request
      'booking_approved',     // When owner approves booking
      'booking_rejected',     // When owner rejects booking
      'booking_cancelled',    // When booking is cancelled
      'new_property',         // When new room/hotel/shop is added
      'admin_announcement',   // Admin system-wide notifications
      'general'              // General notifications
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  relatedRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  relatedHotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false
  },
  relatedShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: false
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // User who triggered the notification
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String, // URL/route to navigate when notification is clicked
    required: false
  },
  data: {
    // Additional data for the notification
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ fromUserId: 1 });

// Virtual to check if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Static method to create notifications
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = []) {
  try {
    const query = { userId, isRead: false };
    if (notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }
    
    const result = await this.updateMany(query, { isRead: true });
    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    const count = await this.countDocuments({ userId, isRead: false });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
