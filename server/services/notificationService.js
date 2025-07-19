const Notification = require('../models/Notification');
const User = require('../models/User');

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

// Send notification to all users when a new property is added
const sendNewPropertyNotification = async ({ propertyId, propertyType, title, ownerId }) => {
  try {
    // Get all users except the owner
    const users = await User.find({ _id: { $ne: ownerId } });
    
    const message = `New ${propertyType} listing: "${title}" is now available!`;
    
    // Create notifications for all users
    const notifications = users.map(user => 
      createNotification(
        user._id, 
        message, 
        'new_property', 
        null, 
        propertyId,
        { propertyType, title }
      )
    );
    
    await Promise.all(notifications);
    console.log(`Created notifications for ${users.length} users about new ${propertyType}: ${title}`);
    
    return true;
  } catch (error) {
    console.error('Send new property notification error:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNewPropertyNotification
};
