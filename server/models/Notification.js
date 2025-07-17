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
    enum: ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'general'],
    required: true
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
  seen: {
    type: Boolean,
    default: false
  },
  data: {
    // Additional data for the notification (e.g., room title, booking details)
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1, seen: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual to check if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
