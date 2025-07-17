import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Nav, Button, Spinner } from 'react-bootstrap';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    inactiveListings: 0,
    totalBookings: 0,
    pendingRequests: 0
  });
  
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  useEffect(() => {
    if (role !== 'owner') {
      alert('Access Denied: Only property owners can access this dashboard.');
      navigate('/');
      return;
    }
    fetchListings();
    fetchBookingRequests();
  }, [role, navigate]);

  const fetchBookingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bookings/owner-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingRequests(response.data);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/rooms/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const roomData = response.data;
      setListings(roomData);
      
      // Calculate stats
      const active = roomData.filter(room => room.isVisible !== false).length;
      const inactive = roomData.filter(room => room.isVisible === false).length;
      
      setStats({
        totalListings: roomData.length,
        activeListings: active,
        inactiveListings: inactive,
        totalBookings: Math.floor(Math.random() * 50) // Mock data for bookings
      });
      
    } catch (error) {
      console.error('Error fetching listings:', error);
      if (error.response) {
        alert(`Server Error (${error.response.status}): ${error.response.data.msg || error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        alert('No response from server. Please check if the server is running and try again.');
      } else {
        alert(`Request Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (roomId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/rooms/${roomId}/toggle-visibility`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setListings(prev => prev.map(room => 
        room._id === roomId 
          ? { ...room, isVisible: !currentStatus }
          : room
      ));
      
      // Update stats
      fetchListings();
      
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error updating room status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setListings(prev => prev.filter(room => room._id !== roomId));
      fetchListings(); // Refresh stats
      
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/bookings/${bookingId}/approve`, 
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Booking request approved successfully!');
      fetchBookingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking request');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking request?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/bookings/${bookingId}/reject`, 
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Booking request rejected!');
      fetchBookingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error rejecting booking request');
    }
  };

  const getFilteredRooms = () => {
    switch (activeTab) {
      case 'active':
        return listings.filter(room => room.isVisible !== false);
      case 'inactive':
        return listings.filter(room => room.isVisible === false);
      default:
        return listings;
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Col md={6} lg={3} className="mb-4">
      <Card className={`h-100 shadow-sm ${color}`}>
        <Card.Body className="text-center">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <i className={`${icon} display-4 text-primary`}></i>
          </div>
          <h2 className="display-6 fw-bold text-primary mb-1">{value}</h2>
          <p className="text-muted mb-0">{title}</p>
        </Card.Body>
      </Card>
    </Col>
  );

  const RoomCard = ({ room }) => (
    <Col md={6} lg={4} className="mb-4">
      <Card className="h-100 shadow-sm room-card">
        <div className="position-relative">
          {room.images && room.images.length > 0 ? (
            <Card.Img 
              variant="top" 
              src={room.images[0]} 
              alt={room.title}
              style={{ height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="bg-light d-flex align-items-center justify-content-center"
              style={{ height: '200px' }}
            >
              <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
          )}
          <Badge 
            bg={room.isVisible !== false ? 'success' : 'secondary'} 
            className="position-absolute top-0 end-0 m-2"
          >
            {room.isVisible !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <Card.Body>
          <Card.Title className="h5 mb-2">{room.title}</Card.Title>
          <Card.Text className="text-muted mb-2">
            <i className="bi bi-geo-alt me-2"></i>
            {room.location || room.city}
          </Card.Text>
          <Card.Text className="text-muted mb-2">
            <i className="bi bi-currency-rupee me-2"></i>
            ₹{room.rent || room.price}/month
          </Card.Text>
          <Card.Text className="text-muted">
            <i className="bi bi-house me-2"></i>
            {room.roomType}
          </Card.Text>
        </Card.Body>
        
        <Card.Footer className="bg-white border-top-0">
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              as={Link}
              to={`/edit-property/${room._id}`}
              variant="outline-primary" 
              size="sm"
              className="flex-fill"
            >
              <i className="bi bi-pencil me-1"></i>Edit
            </Button>
            <Button 
              variant={room.isVisible !== false ? "outline-warning" : "outline-success"}
              size="sm"
              onClick={() => handleToggleStatus(room._id, room.isVisible)}
              className="flex-fill"
            >
              <i className={`bi ${room.isVisible !== false ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
              {room.isVisible !== false ? 'Hide' : 'Show'}
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleDeleteRoom(room._id)}
              className="flex-fill"
            >
              <i className="bi bi-trash me-1"></i>Delete
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );

  if (role !== 'owner') {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col>
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <h1 className="display-5 fw-bold text-primary mb-2">
                <i className="bi bi-speedometer2 me-3"></i>
                Owner Dashboard
              </h1>
              <p className="lead text-muted">Manage your property listings and track performance</p>
            </div>
            <Button as={Link} to="/add-property" variant="primary" size="lg" className="mb-2">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Property
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <StatCard 
          title="Total Rooms Listed" 
          value={stats.totalListings} 
          icon="bi bi-building" 
          color="border-primary" 
        />
        <StatCard 
          title="Active Listings" 
          value={stats.activeListings} 
          icon="bi bi-check-circle-fill" 
          color="border-success" 
        />
        <StatCard 
          title="Inactive Listings" 
          value={stats.inactiveListings} 
          icon="bi bi-pause-circle-fill" 
          color="border-warning" 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon="bi bi-calendar-check-fill" 
          color="border-info" 
        />
      </Row>

      {/* Navigation Tabs */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <Nav variant="tabs" className="card-header-tabs">
            {[
              { key: 'all', label: 'All Rooms', count: stats.totalListings },
              { key: 'active', label: 'Active', count: stats.activeListings },
              { key: 'inactive', label: 'Inactive', count: stats.inactiveListings },
              { key: 'requests', label: 'Booking Requests', count: bookingRequests.filter(req => req.status === 'pending').length }
            ].map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="d-flex align-items-center"
                  style={{ cursor: 'pointer' }}
                >
                  {tab.label}
                  <Badge bg="secondary" className="ms-2">{tab.count}</Badge>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'requests' ? (
        // Booking Requests Section
        bookingRequests.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
              <h4>No booking requests found</h4>
              <p className="text-muted">You haven't received any booking requests yet.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {bookingRequests.map((request) => (
              <Col md={6} lg={4} key={request._id} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="mb-0">{request.room?.title || 'Room Request'}</h6>
                      <Badge 
                        bg={request.status === 'pending' ? 'warning' : 
                            request.status === 'approved' ? 'success' : 'danger'}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-muted mb-1">
                        <strong>Guest:</strong> {request.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Date:</strong> {new Date(request.checkInDate).toLocaleDateString()}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Guests:</strong> {request.guests || 1}
                      </p>
                      {request.message && (
                        <p className="text-muted mb-1">
                          <strong>Message:</strong> {request.message}
                        </p>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleApproveBooking(request._id)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Approve
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRejectBooking(request._id)}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Reject
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )
      ) : (
        // Room Listings Section
        getFilteredRooms().length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-house-x display-1 text-muted mb-3"></i>
              <h4>No {activeTab === 'all' ? '' : activeTab} rooms found</h4>
              <p className="text-muted">
                {activeTab === 'all' 
                  ? "You haven't listed any properties yet." 
                  : `You don't have any ${activeTab} listings.`
                }
              </p>
              {activeTab === 'all' && (
                <Button as={Link} to="/add-property" variant="primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  List Your First Property
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {getFilteredRooms().map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </Row>
        )
      )}
    </Container>
  );
};

export default OwnerDashboard;
