const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async (userId, message, type, relatedBookingId = null, relatedRoomId = null, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      message,
      type,
      relatedBookingId,
      relatedRoomId,
      data
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = {
  createNotification
};
