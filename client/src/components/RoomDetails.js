import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge,
  Carousel, Modal, Form 
} from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config';
import './RoomDetails.css';
import { loadGoogleMapsScript } from './LoadGoogleMaps';
import ErrorBoundary from './ErrorBoundary';
import MapPicker from './MapPicker';
import LoadingSpinner from './LoadingSpinner';
import TopRatedList from './TopRatedList';

function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [bookingData, setBookingData] = useState({
    guests: 1,
    message: '',
    phone: ''
  });

  // Load Google Maps on component mount
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapsLoaded(true))
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
        setMapsLoaded(true); // Continue anyway
      });
  }, []);

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  // Check if property can be booked (only Room and Hotel types)
  const canBeBooked = !room?.type || ['Room', 'Hotel'].includes(room.type);
  const isOwner = room && currentUserId === room.user?._id;

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        let response;
        
        // Fetching property with ID: ${id}
        
        // Try to fetch from different API endpoints
        try {
          // First try rooms API
          // Trying rooms API...
          response = await axios.get(`${API_URL}/api/rooms/${id}`);
          // Found in rooms: response.data
          
          // Add sample coordinates if missing for testing
          if (!response.data.latitude || !response.data.longitude) {
            response.data.latitude = 28.6139; // Delhi latitude
            response.data.longitude = 77.2090; // Delhi longitude
            // Added sample coordinates for rooms
          }
          
          setRoom(response.data);
          return;
        } catch (roomError) {
          // Room not found, trying hotels...
          // If room fails, try hotels API
          try {
            response = await axios.get(`${API_URL}/api/hotels/${id}`);
            // Found in hotels
            
            // Add sample coordinates if missing for testing
            if (!response.data.latitude || !response.data.longitude) {
              response.data.latitude = 28.6139; // Delhi latitude
              response.data.longitude = 77.2090; // Delhi longitude
              // Added sample coordinates for hotels
            }
            
            setRoom(response.data);
            return;
          } catch (hotelError) {
            // Hotel not found, trying shops...
            // If hotel fails, try shops API
            try {
              response = await axios.get(`${API_URL}/api/shops/${id}`);
              // Found in shops
              
              // Add sample coordinates if missing for testing
              if (!response.data.latitude || !response.data.longitude) {
                response.data.latitude = 28.6139; // Delhi latitude
                response.data.longitude = 77.2090; // Delhi longitude
                // Added sample coordinates for shops
              }
              
              setRoom(response.data);
              return;
            } catch (shopError) {
              throw new Error('Property not found in any category');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to book this property');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    
    const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1); // Next day for checkout
    const checkoutDate = nextDate.toISOString().split('T')[0];
    
    const bookingPayload = {
      roomId: room._id,
      checkInDate: currentDate,
      checkOutDate: checkoutDate, // Use next day
      guests: bookingData.guests || 1,
      message: bookingData.message || '',
      contactInfo: {
        phone: bookingData.phone || ''
      }
    };
    
    try {
      // Sending booking request with payload
      
      await axios.post(`${API_URL}/api/bookings/create`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Booking successful
      setShowBookingModal(false);
      alert('Booking request sent successfully!');
    } catch (err) {
      console.error('Booking error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        payload: bookingPayload
      });
      alert(err.response?.data?.message || err.response?.data?.msg || 'Failed to send booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  const getOwnerPhone = () => {
    // For Rooms: check room.phone, room.user.phone, or fallback
    if (room.type === 'Room' || !room.type) {
      return room.phone || room.user?.phone || room.owner?.phone || '1234567890';
    }
    // For Hotels: check contactNumber, owner.phone, or fallback  
    if (room.type === 'Hotel') {
      return room.contactNumber || room.owner?.phone || room.user?.phone || '1234567890';
    }
    // For Shops: check contactNumber, owner.phone, or fallback
    if (room.type === 'Shop') {
      return room.contactNumber || room.owner?.phone || room.user?.phone || '1234567890';
    }
    // Default fallback
    return room.phone || room.contactNumber || room.user?.phone || room.owner?.phone || '1234567890';
  };

  const getOwnerName = () => {
    // For all property types, check user name first, then owner, then fallback
    return room.user?.name || room.owner?.name || 'Property Owner';
  };

  const handleWhatsApp = () => {
    if (!token) {
      alert('Please login to contact the owner');
      return;
    }
    const phone = getOwnerPhone();
    const propertyType = room.type === 'Hotel' ? 'hotel' : room.type === 'Shop' ? 'shop' : 'room';
    const message = `Hi! I'm interested in your ${propertyType}: ${room.title}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = () => {
    if (!token) {
      alert('Please login to contact the owner');
      return;
    }
    const phone = getOwnerPhone();
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading room details..." />;
  }

  if (error || !room) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger border-0" style={{backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#000'}}>
          <h4>Room Not Found</h4>
          <p>{error || 'The room you are looking for does not exist.'}</p>
          <button className="btn btn-outline-danger rounded-pill" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-details-page">
      <Container className="my-4">
        <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i> Back
        </Button>

        <Row>
          {/* Main Content */}
          <Col lg={8} className="pe-lg-4">
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="p-0">
                {room.images?.length > 0 ? (
                  <Carousel className="room-carousel" indicators={false}>
                    {room.images.map((img, i) => (
                      <Carousel.Item key={i}>
                        <div style={{ height: '450px', overflow: 'hidden' }}>
                          <img
                            className="d-block w-100 h-100"
                            src={img.startsWith('http') ? img : `${API_URL}/${img}`}
                            alt={`Room ${i + 1}`}
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="no-image" style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <i className="bi bi-image display-1 text-muted"></i>
                    <p className="text-muted">No images available</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Room Info */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="fw-bold text-dark mb-2">{room.title}</h2>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt me-1"></i>
                      {room.city && room.state ? `${room.city}, ${room.state}` : room.location}
                    </p>
                  </div>
                  <div className="text-end">
                    <h3 className="text-danger fw-bold mb-0">₹{room.price}</h3>
                    <small className="text-muted">per month</small>
                  </div>
                </div>

                <Row className="mb-3">
                  <Col sm={6}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-house me-2 text-primary"></i>
                      <span><strong>Type:</strong> {room.roomType}</span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-tools me-2 text-success"></i>
                      <span><strong>Furnished:</strong> {room.furnished}</span>
                    </div>
                  </Col>
                </Row>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Description</h5>
                  <p className="text-muted">{room.description || 'No description available.'}</p>
                </div>

                {room.facilities?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Facilities</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {room.facilities.map((f, i) => (
                        <Badge key={i} bg="light" text="dark" className="px-3 py-2 border">
                          <i className="bi bi-check-circle me-1 text-success"></i> {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Row className="text-muted small">
                  {room.maxOccupancy && (
                    <Col sm={6} className="mb-2">
                      <i className="bi bi-people me-1"></i> Max {room.maxOccupancy} guests
                    </Col>
                  )}
                  {room.area && (
                    <Col sm={6} className="mb-2">
                      <i className="bi bi-rulers me-1"></i> {room.area} sq ft
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Contact Owner Section */}
            <Card className="mb-4 border-0" style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3" style={{color: '#2c3e50'}}>
                  <i className="bi bi-person-circle me-2" style={{color: '#6f42c1'}}></i>
                  Contact Owner
                </h5>
                
                <div className="mb-3 p-3 rounded" style={{backgroundColor: '#fff', border: '1px solid #e9ecef'}}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                      <i className="bi bi-person text-white"></i>
                    </div>
                    <div>
                      <h6 className="mb-0" style={{color: '#2c3e50'}}>{getOwnerName()}</h6>
                      {room.owner?.isVerified && (
                        <small className="text-success">
                          <i className="bi bi-patch-check me-1"></i> Verified Owner
                        </small>
                      )}
                    </div>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-telephone me-1"></i> {getOwnerPhone() !== '1234567890' ? getOwnerPhone() : 'Contact for phone number'}
                  </small>
                </div>

                {!isOwner ? (
                  <div className="d-grid gap-3">
                    {canBeBooked && (
                      <Button 
                        size="lg"
                        className="fw-bold py-3"
                        style={{
                          backgroundColor: '#6f42c1',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '1.1rem'
                        }}
                        onClick={() => setShowBookingModal(true)}
                      >
                        <i className="bi bi-calendar-check me-2"></i>
                        Book Now
                      </Button>
                    )}
                    
                    <Button 
                      size="lg"
                      className="fw-bold py-3"
                      style={{
                        background: 'linear-gradient(135deg, #25d366, #128c7e)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        color: 'white'
                      }}
                      onClick={handleWhatsApp}
                    >
                      <i className="bi bi-whatsapp me-2"></i>
                      Chat on WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline-dark"
                      size="lg"
                      className="fw-bold py-3"
                      style={{
                        borderWidth: '2px',
                        borderRadius: '12px',
                        fontSize: '1.1rem'
                      }}
                      onClick={handleCall}
                    >
                      <i className="bi bi-telephone me-2"></i>
                      Call Owner
                    </Button>

                    {!canBeBooked && (
                      <div className="alert alert-info border-0 mt-2" style={{ borderRadius: '12px' }}>
                        <i className="bi bi-info-circle me-2"></i>
                        This property is for viewing only. Booking is not available for {room.type || 'this type of property'}.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info border-0" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)', borderRadius: '12px' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    This is your property
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Location Section */}
            <Card className="border-0" style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3" style={{color: '#2c3e50'}}>
                  <i className="bi bi-geo-alt me-2" style={{color: '#6f42c1'}}></i>
                  Location
                </h5>
                
                {room.latitude && room.longitude && mapsLoaded ? (
                  <>
                    <div className="border rounded mb-3 overflow-hidden" style={{ height: '200px', backgroundColor: '#fff' }}>
                      <ErrorBoundary component="map">
                        <MapPicker
                          latitude={parseFloat(room.latitude)}
                          longitude={parseFloat(room.longitude)}
                          setLatLng={() => {}} // Read-only in details view
                        />
                      </ErrorBoundary>
                    </div>
                    
                    <button 
                      className="btn btn-outline-primary w-100"
                      style={{
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}
                      onClick={() => {
                        const lat = room.latitude;
                        const lng = room.longitude;
                        const googleMapsUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                    >
                      <i className="bi bi-arrow-up-right-square me-2"></i>Open in Maps
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4" style={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef'}}>
                    <i className="bi bi-map display-4 text-muted"></i>
                    <p className="text-muted mt-2 mb-0">Map will appear here when location data is available</p>
                    <small className="text-muted">
                      Debug: lat={room.latitude || 'N/A'}, lng={room.longitude || 'N/A'}
                    </small>
                  </div>
                )}
                
                {room.address && (
                  <div className="mt-3 p-2 rounded" style={{backgroundColor: '#fff', border: '1px solid #e9ecef'}}>
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {room.address}
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Booking Modal */}
      <Modal 
        show={showBookingModal} 
        onHide={() => setShowBookingModal(false)} 
        centered
        className="booking-modal"
        size="sm"
        style={{ zIndex: 1060 }}
      >
        <Modal.Header 
          closeButton
          style={{
            background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
            color: 'white',
            border: 'none',
            borderRadius: '12px 12px 0 0',
            padding: '0.75rem 1rem'
          }}
        >
          <Modal.Title style={{ fontSize: '1.1rem' }}>
            <i className="bi bi-calendar-check me-2"></i>
            Book Room
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body style={{ 
            padding: '1rem', 
            background: 'white'
          }}>
            <div className="mb-2 p-2 rounded" style={{
              background: 'rgba(111, 66, 193, 0.1)',
              border: '1px solid rgba(111, 66, 193, 0.2)'
            }}>
              <small className="text-muted">Booking Date: <strong>{new Date().toLocaleDateString()}</strong></small>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Guests</Form.Label>
              <Form.Select
                size="sm"
                value={bookingData.guests}
                onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                style={{
                  borderRadius: '6px'
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Phone <span className="text-danger">*</span></Form.Label>
              <Form.Control
                size="sm"
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                required
                placeholder="Enter phone number"
                value={bookingData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setBookingData({ ...bookingData, phone: val });
                }}
                style={{
                  borderRadius: '6px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Message (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                size="sm"
                rows={3}
                placeholder="Any special requests..."
                value={bookingData.message}
                onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                style={{
                  resize: 'none',
                  borderRadius: '6px'
                }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer 
            style={{
              padding: '0.75rem 1rem',
              background: 'white'
            }}
          >
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setShowBookingModal(false)}
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1rem'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={bookingLoading}
              style={{
                background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: 'white'
              }}
            >
              {bookingLoading ? (
                <>
                  <span className="loading-spinner me-1" style={{width: '12px', height: '12px'}}></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-1"></i>
                  Send Request
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Top Rated Listings Section */}
      <div className="container-fluid py-5" style={{backgroundColor: '#f8f9fa'}}>
        <TopRatedList 
          token={localStorage.getItem("token")}
          onLoginRequired={() => {
            // Navigate to login if user is not authenticated
            navigate('/login');
          }}
        />
      </div>
    </div>
  );
}

export default RoomDetails;
