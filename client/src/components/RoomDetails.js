import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, Spinner,
  Carousel, Modal, Form 
} from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config';
import './RoomDetails.css';
import LoadGoogleMaps from './LoadGoogleMaps';
import MapPicker from './MapPicker';

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
    message: ''
  });

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        let response;
        
        console.log('Fetching property with ID:', id);
        
        // Try to fetch from different API endpoints
        try {
          // First try rooms API
          console.log('Trying rooms API...');
          response = await axios.get(`${API_URL}/api/rooms/${id}`);
          console.log('Found in rooms:', response.data);
          
          // Add sample coordinates if missing for testing
          if (!response.data.latitude || !response.data.longitude) {
            response.data.latitude = 28.6139; // Delhi latitude
            response.data.longitude = 77.2090; // Delhi longitude
            console.log('Added sample coordinates for rooms');
          }
          
          setRoom(response.data);
          return;
        } catch (roomError) {
          console.log('Room not found, trying hotels...');
          // If room fails, try hotels API
          try {
            response = await axios.get(`${API_URL}/api/hotels/${id}`);
            console.log('Found in hotels:', response.data);
            
            // Add sample coordinates if missing for testing
            if (!response.data.latitude || !response.data.longitude) {
              response.data.latitude = 28.6139; // Delhi latitude
              response.data.longitude = 77.2090; // Delhi longitude
              console.log('Added sample coordinates for hotels');
            }
            
            setRoom(response.data);
            return;
          } catch (hotelError) {
            console.log('Hotel not found, trying shops...');
            // If hotel fails, try shops API
            try {
              response = await axios.get(`${API_URL}/api/shops/${id}`);
              console.log('Found in shops:', response.data);
              
              // Add sample coordinates if missing for testing
              if (!response.data.latitude || !response.data.longitude) {
                response.data.latitude = 28.6139; // Delhi latitude
                response.data.longitude = 77.2090; // Delhi longitude
                console.log('Added sample coordinates for shops');
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
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1); // Next day for checkout
      const checkoutDate = nextDate.toISOString().split('T')[0];
      
      const bookingPayload = {
        roomId: room._id,
        checkInDate: currentDate,
        checkOutDate: checkoutDate, // Use next day
        guests: bookingData.guests || 1,
        message: bookingData.message || ''
      };
      
      console.log('Sending booking request:', bookingPayload);
      console.log('API URL:', API_URL);
      
      const response = await axios.post(`${API_URL}/api/bookings/create`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Booking response:', response.data);
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

  const handleWhatsApp = () => {
    const phone = room.owner?.phone || '1234567890';
    const message = `Hi! I'm interested in your property: ${room.title}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = () => {
    const phone = room.owner?.phone || '1234567890';
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" style={{color: '#6f42c1'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3" style={{color: 'rgba(0, 0, 0, 0.8)'}}>Loading property details...</p>
      </div>
    );
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

  const isOwner = currentUserId === room.owner?._id;

  return (
    <div className="room-details-page">
      <LoadGoogleMaps onLoad={() => setMapsLoaded(true)} />
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
                  <Carousel className="room-carousel">
                    {room.images.map((img, i) => (
                      <Carousel.Item key={i}>
                        <img
                          className="d-block w-100 room-image"
                          src={img.startsWith('http') ? img : `${API_URL}/${img}`}
                          alt={`Room ${i + 1}`}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="no-image">
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
                      <h6 className="mb-0" style={{color: '#2c3e50'}}>{room.owner?.name || 'Property Owner'}</h6>
                      {room.owner?.isVerified && (
                        <small className="text-success">
                          <i className="bi bi-patch-check me-1"></i> Verified Owner
                        </small>
                      )}
                    </div>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-telephone me-1"></i> {room.owner?.phone || 'Contact for phone number'}
                  </small>
                </div>

                {!isOwner ? (
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-lg"
                      style={{
                        backgroundColor: '#6f42c1',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}
                      onClick={() => setShowBookingModal(true)}
                    >
                      <i className="bi bi-calendar-check me-2"></i> Book Now
                    </button>
                    
                    <div className="row g-2">
                      <div className="col-6">
                        <button 
                          className="btn btn-success w-100"
                          style={{
                            backgroundColor: '#25d366',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600'
                          }}
                          onClick={handleWhatsApp}
                        >
                          <i className="bi bi-whatsapp me-1"></i> WhatsApp
                        </button>
                      </div>
                      <div className="col-6">
                        <button 
                          className="btn btn-outline-primary w-100"
                          style={{
                            borderRadius: '8px',
                            fontWeight: '600'
                          }}
                          onClick={handleCall}
                        >
                          <i className="bi bi-telephone me-1"></i> Call
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info border-0" style={{backgroundColor: 'rgba(13, 202, 240, 0.1)'}}>
                    <i className="bi bi-info-circle me-2"></i> This is your property
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
                      <MapPicker
                        latitude={parseFloat(room.latitude)}
                        longitude={parseFloat(room.longitude)}
                        setLatLng={() => {}} // Read-only in details view
                      />
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
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book This Room</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <div className="mb-3 p-3 bg-light rounded">
              <h6 className="mb-2">📅 Booking Date</h6>
              <p className="mb-0 text-muted">Current Date: <strong>{new Date().toLocaleDateString()}</strong></p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Number of Guests</Form.Label>
              <Form.Select
                value={bookingData.guests}
                onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Any special requests or questions..."
                value={bookingData.message}
                onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={bookingLoading}>
              {bookingLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending Request...
                </>
              ) : 'Send Booking Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default RoomDetails;
