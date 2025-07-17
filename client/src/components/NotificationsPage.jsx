import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setError('Please login to view notifications');
      setLoading(false);
    }
  }, [token, currentPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications?page=${currentPage}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setNotifications(response.data.notifications);
      setTotalPages(response.data.totalPages);
      setUnreadCount(response.data.unreadCount);
      setError('');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (notificationId) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, seen: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await axios.patch(`${API_URL}/api/notifications/mark-all-seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, seen: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as seen:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return <i className="bi bi-calendar-plus text-primary fs-4"></i>;
      case 'booking_approved':
        return <i className="bi bi-check-circle text-success fs-4"></i>;
      case 'booking_rejected':
        return <i className="bi bi-x-circle text-danger fs-4"></i>;
      case 'booking_cancelled':
        return <i className="bi bi-calendar-x text-warning fs-4"></i>;
      default:
        return <i className="bi bi-bell text-info fs-4"></i>;
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'booking_request':
        return 'Booking Request';
      case 'booking_approved':
        return 'Booking Approved';
      case 'booking_rejected':
        return 'Booking Rejected';
      case 'booking_cancelled':
        return 'Booking Cancelled';
      default:
        return 'Notification';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && currentPage === 1) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading notifications...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Notifications</h2>
              <p className="text-muted mb-0">Stay updated with your booking activities</p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={markAllAsSeen}
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Stats Card */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="py-3">
              <Row className="text-center">
                <Col xs={6} md={3}>
                  <div className="fw-bold text-primary fs-5">{notifications.length}</div>
                  <div className="small text-muted">Total</div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="fw-bold text-warning fs-5">{unreadCount}</div>
                  <div className="small text-muted">Unread</div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="fw-bold text-success fs-5">
                    {notifications.filter(n => n.type === 'booking_approved').length}
                  </div>
                  <div className="small text-muted">Approved</div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="fw-bold text-info fs-5">
                    {notifications.filter(n => n.type === 'booking_request').length}
                  </div>
                  <div className="small text-muted">Requests</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <i className="bi bi-bell-slash display-4 text-muted mb-3 d-block"></i>
                <h4>No notifications yet</h4>
                <p className="text-muted">
                  You'll see booking requests, approvals, and other updates here.
                </p>
                <Link to="/" className="btn btn-primary">
                  Browse Properties
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`mb-3 border-0 shadow-sm notification-card ${!notification.seen ? 'unread' : ''}`}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <Badge 
                              bg="light" 
                              text="dark" 
                              className="me-2 small"
                            >
                              {getNotificationTypeText(notification.type)}
                            </Badge>
                            {!notification.seen && (
                              <Badge bg="primary" className="small">New</Badge>
                            )}
                          </div>
                          <div className="text-muted small">
                            {formatDate(notification.createdAt)}
                          </div>
                        </div>
                        
                        <p className="mb-2 notification-message">
                          {notification.message}
                        </p>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            {notification.relatedRoomId && (
                              <Button
                                as={Link}
                                to={`/room/${notification.relatedRoomId}`}
                                variant="outline-primary"
                                size="sm"
                                onClick={() => !notification.seen && markAsSeen(notification._id)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                View Property
                              </Button>
                            )}
                            {notification.relatedBookingId && (
                              <Button
                                as={Link}
                                to="/my-booking-requests"
                                variant="outline-success"
                                size="sm"
                                onClick={() => !notification.seen && markAsSeen(notification._id)}
                              >
                                <i className="bi bi-calendar-check me-1"></i>
                                View Booking
                              </Button>
                            )}
                            {!notification.seen && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => markAsSeen(notification._id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li 
                      key={index + 1} 
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationsPage;
