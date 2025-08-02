import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import RoomCard from './RoomCard';
import { API_URL } from '../config';

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');

  // Function to clear all saved properties
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved properties?')) {
      localStorage.setItem('savedProperties', JSON.stringify([]));
      setSavedProperties([]);
      
      // Emit event for each property to update other components
      savedProperties.forEach(property => {
        window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
          detail: { propertyId: property._id, isSaved: false }
        }));
      });
    }
  };

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!token) {
          setError('Please login to view saved properties');
          setLoading(false);
          return;
        }

        // Get saved property IDs from localStorage
        const savedIds = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        
        // Remove duplicates using Set
        const uniqueSavedIds = [...new Set(savedIds)];
        
        // Update localStorage if duplicates were found
        if (uniqueSavedIds.length !== savedIds.length) {
          localStorage.setItem('savedProperties', JSON.stringify(uniqueSavedIds));
        }
        
        if (uniqueSavedIds.length === 0) {
          setSavedProperties([]);
          setLoading(false);
          return;
        }

        // Fetch all saved properties from different endpoints
        const propertyPromises = uniqueSavedIds.map(async (id) => {
          try {
            // Try rooms first
            const roomResponse = await axios.get(`${API_URL}/api/rooms/${id}`);
            return { ...roomResponse.data, propertyType: 'Room' };
          } catch {
            try {
              // Try hotels
              const hotelResponse = await axios.get(`${API_URL}/api/hotels/${id}`);
              return { ...hotelResponse.data, propertyType: 'Hotel' };
            } catch {
              try {
                // Try shops
                const shopResponse = await axios.get(`${API_URL}/api/shops/${id}`);
                return { ...shopResponse.data, propertyType: 'Shop' };
              } catch {
                return null; // Property not found
              }
            }
          }
        });

        const results = await Promise.all(propertyPromises);
        const validProperties = results.filter(property => property !== null);
        
        setSavedProperties(validProperties);
      } catch (err) {
        console.error('Error fetching saved properties:', err);
        setError('Failed to load saved properties');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();

    // Listen for changes to saved properties
    const handleSavedPropertiesChange = () => {
      fetchSavedProperties();
    };

    window.addEventListener('savedPropertiesChanged', handleSavedPropertiesChange);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleSavedPropertiesChange);
    };
  }, [token]);

  const getPropertyTypeColor = (type) => {
    switch (type) {
      case 'Room': return 'primary';
      case 'Hotel': return 'success';
      case 'Shop': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading your saved properties...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bi bi-heart-fill me-2 text-danger"></i>
                Saved Properties
              </h2>
              <p className="text-muted mb-0">
                Your favorite rooms, hotels, and shops
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Badge bg="primary" className="fs-6 px-3 py-2">
                {savedProperties.length} Properties
              </Badge>
              {savedProperties.length > 0 && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearAll}
                  title="Clear all saved properties"
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {savedProperties.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-heart display-1 text-muted mb-3"></i>
            <h4>No Saved Properties</h4>
            <p className="text-muted mb-4">
              You haven't saved any properties yet. Browse our listings and click the heart icon to save your favorites!
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a href="/rooms" className="btn btn-primary">
                <i className="bi bi-door-open me-2"></i>Browse Rooms
              </a>
              <a href="/hotels" className="btn btn-success">
                <i className="bi bi-building me-2"></i>Browse Hotels
              </a>
              <a href="/shops" className="btn btn-warning">
                <i className="bi bi-shop me-2"></i>Browse Shops
              </a>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Property Type Summary */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex gap-3 flex-wrap">
                {['Room', 'Hotel', 'Shop'].map(type => {
                  const count = savedProperties.filter(p => p.propertyType === type).length;
                  if (count === 0) return null;
                  return (
                    <Badge 
                      key={type}
                      bg={getPropertyTypeColor(type)} 
                      className="d-flex align-items-center px-3 py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className={`bi ${type === 'Room' ? 'bi-door-open' : type === 'Hotel' ? 'bi-building' : 'bi-shop'} me-2`}></i>
                      {count} {type}{count > 1 ? 's' : ''}
                    </Badge>
                  );
                })}
              </div>
            </Col>
          </Row>

          {/* Properties Grid */}
          <Row>
            {savedProperties.map((property) => (
              <Col key={property._id} xs={12} sm={6} lg={4} xl={3} className="mb-4">
                <div className="position-relative">
                  <RoomCard room={property} />
                  <Badge 
                    bg={getPropertyTypeColor(property.propertyType)}
                    className="position-absolute"
                    style={{
                      top: '10px',
                      left: '10px',
                      zIndex: 5,
                      fontSize: '0.7rem'
                    }}
                  >
                    {property.propertyType}
                  </Badge>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default SavedProperties;
