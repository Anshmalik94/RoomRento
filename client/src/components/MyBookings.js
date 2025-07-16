import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import BASE_URL from '../config';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [viewType, setViewType] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/bookings/${bookingId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`Booking ${status} successfully!`);
      fetchBookings(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating booking:', error);
      setMessage('Error updating booking status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending Review' },
      accepted: { variant: 'success', text: 'Accepted' },
      declined: { variant: 'danger', text: 'Declined' },
      booked: { variant: 'info', text: 'Booked' },
      completed: { variant: 'secondary', text: 'Completed' },
      cancelled: { variant: 'dark', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
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
          <p className="mt-2">Loading bookings...</p>
        </div>
      </Container>
    );
  }

  const renderCards = () => (
    <Row>
      {bookings.map((booking) => (
        <Col lg={6} xl={4} key={booking._id} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 text-primary">Booking Request</h6>
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
                <strong className="text-muted d-block">Renter Details</strong>
                <p className="mb-1">
                  <i className="bi bi-person me-2"></i>
                  {booking.renter?.name}
                </p>
                <p className="mb-1">
                  <i className="bi bi-envelope me-2"></i>
                  {booking.renter?.email}
                </p>
                {booking.renter?.phone && (
                  <p className="mb-0">
                    <i className="bi bi-telephone me-2"></i>
                    {booking.renter.phone}
                  </p>
                )}
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
                  <strong className="text-muted d-block">Message</strong>
                  <p className="mb-0 text-muted">{booking.message}</p>
                </div>
              )}
            </Card.Body>

            {booking.status === 'pending' && (
              <Card.Footer className="bg-white">
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => updateBookingStatus(booking._id, 'accepted')}
                  >
                    <i className="bi bi-check-lg me-1"></i>Accept
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => updateBookingStatus(booking._id, 'declined')}
                  >
                    <i className="bi bi-x-lg me-1"></i>Decline
                  </Button>
                </div>
              </Card.Footer>
            )}

            {booking.status === 'accepted' && (
              <Card.Footer className="bg-white">
                <Button 
                  variant="info" 
                  size="sm" 
                  onClick={() => updateBookingStatus(booking._id, 'booked')}
                  className="w-100"
                >
                  <i className="bi bi-calendar-check me-1"></i>Mark as Booked
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderTable = () => (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th>Property</th>
            <th>Renter</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>
                <div>
                  <strong>{booking.room?.title}</strong>
                  <br />
                  <small className="text-muted">{booking.room?.location}</small>
                </div>
              </td>
              <td>
                <div>
                  <strong>{booking.renter?.name}</strong>
                  <br />
                  <small className="text-muted">{booking.renter?.email}</small>
                </div>
              </td>
              <td>{formatDate(booking.checkInDate)}</td>
              <td>{formatDate(booking.checkOutDate)}</td>
              <td className="text-success fw-bold">{formatCurrency(booking.totalAmount)}</td>
              <td>{getStatusBadge(booking.status)}</td>
              <td>
                {booking.status === 'pending' && (
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => updateBookingStatus(booking._id, 'accepted')}
                    >
                      <i className="bi bi-check"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => updateBookingStatus(booking._id, 'declined')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                )}
                {booking.status === 'accepted' && (
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => updateBookingStatus(booking._id, 'booked')}
                  >
                    <i className="bi bi-calendar-check"></i>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bi bi-calendar-check me-2 text-primary"></i>
                My Bookings
              </h2>
              <p className="text-muted mb-0">Manage your property booking requests</p>
            </div>
            
            <div className="d-flex gap-2">
              <Button 
                variant={viewType === 'cards' ? 'primary' : 'outline-primary'} 
                size="sm"
                onClick={() => setViewType('cards')}
              >
                <i className="bi bi-grid-3x2-gap me-1"></i>Cards
              </Button>
              <Button 
                variant={viewType === 'table' ? 'primary' : 'outline-primary'} 
                size="sm"
                onClick={() => setViewType('table')}
              >
                <i className="bi bi-table me-1"></i>Table
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {message && (
        <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h4>No Booking Requests</h4>
            <p className="text-muted">You haven't received any booking requests yet.</p>
            <Button variant="outline-primary" href="/add-property">
              <i className="bi bi-plus-circle me-2"></i>Add New Property
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Total Requests: <Badge bg="primary">{bookings.length}</Badge>
                </h5>
                <div className="d-flex gap-3">
                  <span>
                    Pending: <Badge bg="warning">{bookings.filter(b => b.status === 'pending').length}</Badge>
                  </span>
                  <span>
                    Accepted: <Badge bg="success">{bookings.filter(b => b.status === 'accepted').length}</Badge>
                  </span>
                  <span>
                    Booked: <Badge bg="info">{bookings.filter(b => b.status === 'booked').length}</Badge>
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {viewType === 'cards' ? renderCards() : renderTable()}
        </>
      )}
    </Container>
  );
};

export default MyBookings;
