const Notification = require('../models/Notification');
const User = require('../models/User');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Shop = require('../models/Shop');

class RealTimeNotificationService {
  constructor() {
    this.io = null; // Will be set when socket.io is initialized
  }

  // Set socket.io instance
  setSocketIO(io) {
    this.io = io;
  }

  // Send real-time notification via socket
  emitToUser(userId, notification) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('newNotification', notification);
      this.io.to(`user_${userId}`).emit('updateNotificationCount', notification.userId);
    }
  }

  // Send notification to multiple users
  emitToMultipleUsers(userIds, notification) {
    if (this.io && userIds.length > 0) {
      userIds.forEach(userId => {
        this.io.to(`user_${userId}`).emit('newNotification', notification);
        this.io.to(`user_${userId}`).emit('updateNotificationCount', userId);
      });
    }
  }

  // 1. Booking Request Notification (to Owner)
  async sendBookingRequestNotification(bookingData) {
    try {
      const { ownerId, userId, roomId, hotelId, shopId, propertyTitle, userName } = bookingData;

      const notification = await Notification.createNotification({
        userId: ownerId,
        title: 'New Booking Request',
        message: `New booking request received from ${userName} for "${propertyTitle}"`,
        type: 'booking_request',
        fromUserId: userId,
        relatedRoomId: roomId || null,
        relatedHotelId: hotelId || null,
        relatedShopId: shopId || null,
        link: `/owner-dashboard/booking-requests`,
        priority: 'high',
        data: {
          propertyTitle,
          userName,
          requestDate: new Date()
        }
      });

      // Emit real-time notification
      this.emitToUser(ownerId, notification);

      return notification;
    } catch (error) {
      console.error('Error sending booking request notification:', error);
      throw error;
    }
  }

  // 2. Booking Response Notifications (to User)
  async sendBookingResponseNotification(responseData) {
    try {
      const { userId, status, propertyTitle, propertyType, propertyId } = responseData;
      
      const isApproved = status === 'approved';
      const statusText = isApproved ? 'approved' : 'rejected';
      
      const notification = await Notification.createNotification({
        userId: userId,
        title: `Booking ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your booking request for "${propertyTitle}" was ${statusText}`,
        type: isApproved ? 'booking_approved' : 'booking_rejected',
        relatedRoomId: propertyType === 'room' ? propertyId : null,
        relatedHotelId: propertyType === 'hotel' ? propertyId : null,
        relatedShopId: propertyType === 'shop' ? propertyId : null,
        link: `/my-bookings`,
        priority: 'high',
        data: {
          propertyTitle,
          status,
          responseDate: new Date()
        }
      });

      // Emit real-time notification
      this.emitToUser(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error sending booking response notification:', error);
      throw error;
    }
  }

  // 3. New Property Notification (to all Users)

  async sendNewPropertyNotification(propertyData) {
    try {
      const { propertyId, propertyType, title, ownerId, city } = propertyData;
      // Get all renters in the same city (exclude the property owner)

      // Send to all users (renters and owners) except the property owner
      const userQuery = {
        _id: { $ne: ownerId }
      };
      // if (city) userQuery.city = city; // Uncomment for city-based targeting
      const users = await User.find(userQuery).select('_id');

      const userIds = users.map(user => user._id);
      if (userIds.length === 0) return;

      // Create notifications for all relevant renters
      const notifications = await Promise.all(
        userIds.map(userId => 
          Notification.createNotification({
            userId: userId,
            title: 'New Rentify Space Available',
            message: 'Good news! A new rental space is now available. Visit RoomRento to view details.',
            type: 'new_property',
            fromUserId: ownerId,
            relatedRoomId: propertyType === 'room' ? propertyId : null,
            relatedHotelId: propertyType === 'hotel' ? propertyId : null,
            relatedShopId: propertyType === 'shop' ? propertyId : null,
            link: `/${propertyType}s/${propertyId}`,
            priority: 'medium',
            data: {
              propertyTitle: title,
              propertyType,
              addedDate: new Date(),
              city: city || ''
            }
          })
        )
      );

      // Emit real-time notifications to all renters
      this.emitToMultipleUsers(userIds, notifications[0]);

      return notifications;
    } catch (error) {
      console.error('Error sending new property notification:', error);
      throw error;
    }
  }

  // 4. Admin Announcement (to all Users and Owners)
  async sendAdminAnnouncement(announcementData) {
    try {
      const { title, content, priority = 'high', link = null } = announcementData;
      
      // Get all users and owners
      const allUsers = await User.find({}).select('_id role');
      const userIds = allUsers.map(user => user._id);

      if (userIds.length === 0) return;

      // Create notifications for all users
      const notifications = await Promise.all(
        userIds.map(userId => 
          Notification.createNotification({
            userId: userId,
            title: 'Admin Announcement',
            message: `${title}: ${content}`,
            type: 'admin_announcement',
            link: link,
            priority: priority,
            data: {
              announcementTitle: title,
              announcementContent: content,
              announcementDate: new Date()
            }
          })
        )
      );

      // Emit real-time notifications to all users
      this.emitToMultipleUsers(userIds, notifications[0]);

      return notifications;
    } catch (error) {
      console.error('Error sending admin announcement:', error);
      throw error;
    }
  }

  // 5. Get user notifications with pagination
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Check if it's a demo user (string-based ID)
      if (typeof userId === 'string' && userId.startsWith('demo_')) {
        // For demo users, return empty notifications or mock data
        return {
          notifications: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 0,
            hasMore: false
          },
          unreadCount: 0
        };
      }
      
      const notifications = await Notification.find({ userId })
        .populate('fromUserId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalCount = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.getUnreadCount(userId);

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + notifications.length < totalCount
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // 6. Mark notifications as read
  async markNotificationsAsRead(userId, notificationIds = []) {
    try {
      // Check if it's a demo user (string-based ID)
      if (typeof userId === 'string' && userId.startsWith('demo_')) {
        return { modifiedCount: 0 };
      }
      
      const result = await Notification.markAsRead(userId, notificationIds);
      
      // Emit updated count
      if (this.io) {
        const newUnreadCount = await Notification.getUnreadCount(userId);
        this.io.to(`user_${userId}`).emit('notificationCountUpdated', newUnreadCount);
      }

      return result;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  // 7. Get unread notification count
  async getUnreadCount(userId) {
    try {
      // Check if it's a demo user (string-based ID)
      if (typeof userId === 'string' && userId.startsWith('demo_')) {
        return 0;
      }
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // 8. Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      // Check if it's a demo user (string-based ID)
      if (typeof userId === 'string' && userId.startsWith('demo_')) {
        return null;
      }
      
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: userId
      });

      if (result && this.io) {
        const newUnreadCount = await Notification.getUnreadCount(userId);
        this.io.to(`user_${userId}`).emit('notificationCountUpdated', newUnreadCount);
      }

      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // 9. Clear all notifications for a user
  async clearAllNotifications(userId) {
    try {
      // Check if it's a demo user (string-based ID)
      if (typeof userId === 'string' && userId.startsWith('demo_')) {
        return { deletedCount: 0 };
      }
      
      const result = await Notification.deleteMany({ userId });
      
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notificationCountUpdated', 0);
      }

      return result;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new RealTimeNotificationService();
