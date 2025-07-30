import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Nav, Button } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';
import './OwnerDashboard.css';

const OwnerDashboard = ({ handleRentifyClick }) => {
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
  }, [role, navigate]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      

      // Fetch listings (rooms, hotels, and shops)
      const [roomsResponse, hotelsResponse, shopsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/rooms/my-listings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/hotels/my-listings`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/shops/my-listings`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Fetch booking requests
      const bookingsResponse = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const roomData = (roomsResponse.data || []).map(r => ({ ...r, propertyType: 'Room' }));
      const hotelData = (hotelsResponse.data || []).map(h => ({ ...h, propertyType: 'Hotel' }));
      const shopData = (shopsResponse.data || []).map(s => ({ ...s, propertyType: 'Shop' }));
      const allListings = [...roomData, ...hotelData, ...shopData];
      const bookingData = bookingsResponse.data;

      setListings(allListings);
      setBookingRequests(bookingData);

      // Calculate stats with real data
      const active = allListings.filter(item => item.isVisible !== false).length;
      const inactive = allListings.filter(item => item.isVisible === false).length;

      setStats({
        totalListings: allListings.length,
        activeListings: active,
        inactiveListings: inactive,
        totalBookings: bookingData.length // Real booking count
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

  const handleToggleStatus = async (itemId, currentStatus, propertyType) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = propertyType === 'Hotel' ? 'hotels' : propertyType === 'Shop' ? 'shops' : 'rooms';
      
      await axios.patch(`${API_URL}/api/${endpoint}/${itemId}/toggle-visibility`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setListings(prev => prev.map(item => 
        item._id === itemId 
          ? { ...item, isVisible: !currentStatus }
          : item
      ));
      
      // Update stats
      fetchListings();
      
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(`Error updating ${propertyType.toLowerCase()} status`);
    }
  };

  const handleDeleteItem = async (itemId, propertyType) => {
    if (!window.confirm(`Are you sure you want to delete this ${propertyType.toLowerCase()}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = propertyType === 'Hotel' ? 'hotels' : propertyType === 'Shop' ? 'shops' : 'rooms';
      
      await axios.delete(`${API_URL}/api/${endpoint}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setListings(prev => prev.filter(item => item._id !== itemId));
      fetchListings(); // Refresh stats
      
    } catch (error) {
      console.error(`Error deleting ${propertyType.toLowerCase()}:`, error);
      alert(`Error deleting ${propertyType.toLowerCase()}`);
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
      fetchListings(); // Refresh the data
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
      fetchListings(); // Refresh the data
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error rejecting booking request');
    }
  };

  const getFilteredProperties = () => {
    switch (activeTab) {
      case 'active':
        return listings.filter(property => property.isVisible !== false);
      case 'inactive':
        return listings.filter(property => property.isVisible === false);
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

  const PropertyCard = ({ property }) => (
    <Col md={6} lg={4} className="mb-4">
      <Card className="h-100 shadow-sm room-card">
        <div className="position-relative">
          {property.images && property.images.length > 0 ? (
            <Card.Img 
              variant="top" 
              src={property.images[0]} 
              alt={property.title}
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
            bg={property.isVisible !== false ? 'success' : 'secondary'} 
            className="position-absolute top-0 end-0 m-2"
          >
            {property.isVisible !== false ? 'Active' : 'Inactive'}
          </Badge>
          <Badge 
            bg="info" 
            className="position-absolute top-0 start-0 m-2"
          >
            {property.propertyType}
          </Badge>
        </div>
        
        <Card.Body>
          <Card.Title className="h5 mb-2">{property.title}</Card.Title>
          <Card.Text className="text-muted mb-2">
            <i className="bi bi-geo-alt me-2"></i>
            {property.location || property.city}
          </Card.Text>
          <Card.Text className="text-muted mb-2">
            <i className="bi bi-currency-rupee me-2"></i>
            ₹{property.rent || property.price}/month
          </Card.Text>
          <Card.Text className="text-muted">
            <i className="bi bi-house me-2"></i>
            {property.roomType || property.category || property.propertyType}
          </Card.Text>
        </Card.Body>
        
        <Card.Footer className="bg-white border-top-0">
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              as={Link}
              to={`/edit-property/${property._id}`}
              variant="outline-primary" 
              size="sm"
              className="flex-fill"
            >
              <i className="bi bi-pencil me-1"></i>Edit
            </Button>
            <Button 
              variant={property.isVisible !== false ? "outline-warning" : "outline-success"}
              size="sm"
              onClick={() => handleToggleStatus(property._id, property.isVisible, property.propertyType)}
              className="flex-fill"
            >
              <i className={`bi ${property.isVisible !== false ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
              {property.isVisible !== false ? 'Hide' : 'Show'}
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleDeleteItem(property._id, property.propertyType)}
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
    return <LoadingSpinner isLoading={loading} message="Loading your dashboard..." />;
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
            <Button 
              onClick={handleRentifyClick} 
              variant="primary" 
              size="lg" 
              className="mb-2"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Rentify - Add Property
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <StatCard 
          title="Total Properties Listed" 
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
              { key: 'all', label: 'All Properties', count: stats.totalListings },
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
                        <strong>Guest:</strong> {request.renter?.name || 'Unknown User'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Email:</strong> {request.renter?.email || 'No email'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Date:</strong> {new Date(request.checkInDate).toLocaleDateString()}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Amount:</strong> ₹{request.totalAmount || 'N/A'}
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
        // Property Listings Section
        getFilteredProperties().length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-house-x display-1 text-muted mb-3"></i>
              <h4>No {activeTab === 'all' ? '' : activeTab} properties found</h4>
              <p className="text-muted">
                {activeTab === 'all' 
                  ? "You haven't listed any properties yet." 
                  : `You don't have any ${activeTab} listings.`
                }
              </p>
              {activeTab === 'all' && (
                <Button 
                  onClick={handleRentifyClick} 
                  variant="primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Rentify - List Your First Property
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {getFilteredProperties().map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </Row>
        )
      )}
    </Container>
  );
};

export default OwnerDashboard;
