import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { API_URL } from '../config';
import './MyBookingRequests.css';

const MyBookingRequests = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bookings/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingRequests(response.data);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      setMessage('Error loading booking requests');
    } finally {
      setLoading(false);
    }
  };

  const cancelBookingRequest = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Booking request cancelled successfully!');
      fetchBookingRequests(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setMessage('Error cancelling booking request');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending Review', icon: 'bi-clock' },
      accepted: { variant: 'success', text: 'Accepted', icon: 'bi-check-circle' },
      declined: { variant: 'danger', text: 'Declined', icon: 'bi-x-circle' },
      booked: { variant: 'info', text: 'Booked', icon: 'bi-calendar-check' },
      completed: { variant: 'secondary', text: 'Completed', icon: 'bi-check-all' },
      cancelled: { variant: 'dark', text: 'Cancelled', icon: 'bi-x-square' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: 'bi-info' };
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <i className={`bi ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your booking requests...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-calendar-event me-3 text-primary" style={{fontSize: '2rem'}}></i>
            <div>
              <h2 className="mb-0">My Booking Requests</h2>
              <p className="text-muted mb-0">Track your room booking requests and their status</p>
            </div>
          </div>
        </Col>
      </Row>

      {message && (
        <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}

      {bookingRequests.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h4>No Booking Requests</h4>
            <p className="text-muted">You haven't made any booking requests yet.</p>
            <Button variant="outline-primary" href="/rooms">
              <i className="bi bi-search me-2"></i>Browse Rooms
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Total Requests: <Badge bg="primary">{bookingRequests.length}</Badge>
                </h5>
                <div className="d-flex gap-3">
                  <span>
                    Pending: <Badge bg="warning">{bookingRequests.filter(b => b.status === 'pending').length}</Badge>
                  </span>
                  <span>
                    Accepted: <Badge bg="success">{bookingRequests.filter(b => b.status === 'accepted').length}</Badge>
                  </span>
                  <span>
                    Booked: <Badge bg="info">{bookingRequests.filter(b => b.status === 'booked').length}</Badge>
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            {bookingRequests.map((booking) => (
              <Col lg={6} xl={4} key={booking._id} className="mb-4">
                <Card className={`h-100 shadow-sm booking-request-card status-${booking.status}`}>
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-building me-2"></i>
                        Booking Request
                      </h6>
                      {getStatusBadge(booking.status)}
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="mb-3">
                      <strong className="text-muted d-block">Property</strong>
                      <h5 className="mb-1">{booking.room?.title}</h5>
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {booking.room?.location}
                      </small>
                    </div>

                    <div className="mb-3">
                      <strong className="text-muted d-block">Owner Details</strong>
                      <p className="mb-1">
                        <i className="bi bi-person me-2"></i>
                        {booking.owner?.name}
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        {booking.owner?.email}
                      </p>
                    </div>

                    <div className="mb-3">
                      <Row>
                        <Col xs={6}>
                          <strong className="text-muted d-block">Check-in</strong>
                          <p className="mb-0">{formatDate(booking.checkInDate)}</p>
                        </Col>
                        <Col xs={6}>
                          <strong className="text-muted d-block">Check-out</strong>
                          <p className="mb-0">{formatDate(booking.checkOutDate)}</p>
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-3">
                      <strong className="text-muted d-block">Total Amount</strong>
                      <h5 className="text-success mb-0">{formatCurrency(booking.totalAmount)}</h5>
                    </div>

                    <div className="mb-3">
                      <strong className="text-muted d-block">Request Date</strong>
                      <p className="mb-0">{formatDate(booking.createdAt)}</p>
                    </div>

                    {booking.message && (
                      <div className="mb-3">
                        <strong className="text-muted d-block">Your Message</strong>
                        <p className="mb-0 text-muted fst-italic">"{booking.message}"</p>
                      </div>
                    )}
                  </Card.Body>

                  {booking.status === 'pending' && (
                    <Card.Footer className="bg-white">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => cancelBookingRequest(booking._id)}
                        className="w-100"
                      >
                        <i className="bi bi-trash me-1"></i>Cancel Request
                      </Button>
                    </Card.Footer>
                  )}

                  {booking.status === 'accepted' && (
                    <Card.Footer className="bg-success bg-opacity-10">
                      <div className="text-center">
                        <small className="text-success fw-bold">
                          <i className="bi bi-check-circle me-1"></i>
                          Great! Your request has been accepted. The owner will contact you soon.
                        </small>
                      </div>
                    </Card.Footer>
                  )}

                  {booking.status === 'booked' && (
                    <Card.Footer className="bg-info bg-opacity-10">
                      <div className="text-center">
                        <small className="text-info fw-bold">
                          <i className="bi bi-calendar-check me-1"></i>
                          Booking confirmed! Enjoy your stay.
                        </small>
                      </div>
                    </Card.Footer>
                  )}

                  {booking.status === 'declined' && (
                    <Card.Footer className="bg-danger bg-opacity-10">
                      <div className="text-center">
                        <small className="text-danger fw-bold">
                          <i className="bi bi-x-circle me-1"></i>
                          Request declined. You can try other properties.
                        </small>
                      </div>
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default MyBookingRequests;
