import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import './RoomsList.css'; // Reuse existing styles
import TopRatedList from './TopRatedList';

const AllPropertiesSection = ({ filters }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageColors, setImageColors] = useState({});

  // Function to detect if image is light or dark
  const getImageBrightness = (imageSrc, propertyId) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      
      try {
        ctx.drawImage(this, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let colorSum = 0;
        let pixelCount = 0;
        
        // Sample pixels to calculate average brightness
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance using standard formula
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          colorSum += luminance;
          pixelCount++;
        }
        
        const avgBrightness = colorSum / pixelCount;
        const isLight = avgBrightness > 128; // Threshold for light/dark
        
        setImageColors(prev => ({
          ...prev,
          [propertyId]: isLight ? 'dark' : 'light' // dark text on light bg, light text on dark bg
        }));
      } catch (error) {
        // Fallback to light text if image analysis fails
        setImageColors(prev => ({
          ...prev,
          [propertyId]: 'light'
        }));
      }
    };
    
    img.onerror = function() {
      // Fallback to light text if image fails to load
      setImageColors(prev => ({
        ...prev,
        [propertyId]: 'light'
      }));
    };
    
    img.src = imageSrc;
  };

  const fetchAllProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch rooms, hotels, and shops with individual error handling
      const fetchWithFallback = async (url, fallback = []) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`API ${url} failed with status ${response.status}`);
            return fallback;
          }
          return await response.json();
        } catch (error) {
          console.warn(`API ${url} failed:`, error);
          return fallback;
        }
      };

      const [roomsData, hotelsData, shopsData] = await Promise.all([
        fetchWithFallback(`${API_URL}/api/rooms`, []),
        fetchWithFallback(`${API_URL}/api/hotels`, { hotels: [] }),
        fetchWithFallback(`${API_URL}/api/shops`, { shops: [] })
      ]);

      // Combine all properties with type indicator
      const allProperties = [
        ...(Array.isArray(roomsData) ? roomsData : []).map(item => ({ ...item, propertyType: 'Room' })),
        ...(hotelsData.hotels || []).map(item => ({ ...item, propertyType: 'Hotel' })),
        ...(shopsData.shops || []).map(item => ({ ...item, propertyType: 'Shop' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

      setProperties(allProperties);
      
      // Analyze image brightness for each property
      allProperties.forEach(property => {
        if (property.images && property.images.length > 0) {
          getImageBrightness(property.images[0], property._id);
        }
      });
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProperties();
  }, [filters, fetchAllProperties]);

  const getPropertyIcon = (type) => {
    switch (type) {
      case 'Room': return 'bi-door-open';
      case 'Hotel': return 'bi-building';
      case 'Shop': return 'bi-shop';
      default: return 'bi-house';
    }
  };

  const getPropertyColor = (type) => {
    switch (type) {
      case 'Room': return '#6f42c1';
      case 'Hotel': return '#6f42c1';
      case 'Shop': return '#6f42c1';
      default: return '#6f42c1';
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" style={{color: '#6f42c1'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2" style={{color: '#000'}}>Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div id="explore-newly-listed" className="container my-5 all-properties-section">
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h2 className="fw-bold mb-3 animate__animated animate__fadeInUp" style={{ 
            fontSize: '2.5rem', 
            color: '#000',
            letterSpacing: '-0.5px',
            animationDelay: '0.2s'
          }}>
            Explore Newly Listed
          </h2>
          <p className="text-muted lead mb-0 animate__animated animate__fadeInUp" style={{ 
            fontSize: '1.1rem',
            color: '#666',
            animationDelay: '0.4s'
          }}>
            Discover the latest rooms, hotels, and shops available for rent
          </p>
          <div className="mx-auto mt-3 animate__animated animate__fadeInUp" style={{
            width: '60px',
            height: '4px',
            background: 'linear-gradient(45deg, #6f42c1, #fff)',
            borderRadius: '2px',
            animationDelay: '0.6s'
          }}></div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-house-slash display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No properties found</h4>
          <p className="text-muted">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="row g-4">
          {properties.slice(0, 6).map((property, index) => {
            const getRedirectUrl = () => {
              switch (property.propertyType) {
                case 'Room': return `/room/${property._id}`;
                case 'Hotel': return `/room/${property._id}`; // Hotels use same detail page as rooms
                case 'Shop': return `/room/${property._id}`; // Shops use room details page
                default: return '/';
              }
            };

            return (
              <div key={`${property.propertyType}-${property._id}-${index}`} className="col-lg-4 col-md-6">
                <div 
                  className="card h-100 shadow-sm border-0 property-card" 
                  style={{ 
                    borderRadius: '15px', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => window.location.href = getRedirectUrl()}
                >
                  {/* Property Type Badge */}
                  <div className="position-relative">
                    <span 
                      className="badge position-absolute top-0 start-0 m-3 z-3"
                      style={{ 
                        backgroundColor: getPropertyColor(property.propertyType),
                        color: 'white',
                        fontSize: '0.9rem',
                        padding: '8px 12px',
                        borderRadius: '20px'
                      }}
                    >
                      <i className={`bi ${getPropertyIcon(property.propertyType)} me-1`}></i>
                      {property.propertyType}
                    </span>
                    
                    {/* Available Facilities & Amenities Overlay */}
                    <div 
                      className="position-absolute bottom-0 start-0 end-0 p-3 z-2"
                    >
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {(property.amenities || property.facilities)?.slice(0, 3).map((item, i) => {
                          const textColor = imageColors[property._id] === 'dark' ? '#000000' : '#ffffff';
                          const shadowColor = imageColors[property._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                          
                          return (
                            <span 
                              key={i} 
                              className="small"
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 8px',
                                color: textColor,
                                textShadow: `2px 2px 4px ${shadowColor}`
                              }}
                            >
                              {item}
                            </span>
                          );
                        })}
                        {(property.amenities || property.facilities)?.length > 3 && (
                          <span 
                            className="small"
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '4px 8px',
                              color: imageColors[property._id] === 'dark' ? '#000000' : '#ffffff',
                              textShadow: `2px 2px 4px ${imageColors[property._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                            }}
                          >
                            +{(property.amenities || property.facilities).length - 3}
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        padding: '6px 10px',
                        color: imageColors[property._id] === 'dark' ? '#000000' : '#ffffff',
                        textShadow: `2px 2px 4px ${imageColors[property._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                      }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Available Facilities & Amenities
                      </div>
                    </div>
                    
                    {/* Image */}
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        className="card-img-top"
                        alt={property.title}
                        style={{ height: '220px', objectFit: 'cover' }}
                        onLoad={() => {
                          // Re-analyze image when it loads
                          if (!imageColors[property._id]) {
                            getImageBrightness(property.images[0], property._id);
                          }
                        }}
                      />
                    ) : (
                      <div 
                        className="card-img-top d-flex align-items-center justify-content-center bg-light"
                        style={{ height: '220px' }}
                      >
                        <i className={`bi ${getPropertyIcon(property.propertyType)} display-4 text-muted`}></i>
                      </div>
                    )}
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="card-title fw-bold mb-2" style={{ fontSize: '1.25rem' }}>
                      {property.title}
                    </h5>
                    <p className="card-text text-muted small flex-grow-1 mb-3" style={{ lineHeight: '1.5' }}>
                      {property.description?.substring(0, 120)}...
                    </p>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h4 mb-0 fw-bold" style={{ color: '#000000' }}>
                          ₹{property.price?.toLocaleString()}
                          <small className="text-muted fs-6 fw-normal">
                            {property.propertyType === 'Room' && '/month'}
                            {property.propertyType === 'Hotel' && '/night'}
                            {property.propertyType === 'Shop' && '/month'}
                          </small>
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center text-muted small mb-3">
                        <i className="bi bi-geo-alt-fill me-2" style={{ color: getPropertyColor(property.propertyType) }}></i>
                        <span className="text-truncate">{property.location}</span>
                      </div>

                      {/* Property specific info */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {property.propertyType === 'Room' && property.roomType && (
                          <span className="badge bg-light text-dark border small">
                            <i className="bi bi-house me-1"></i>
                            {property.roomType}
                          </span>
                        )}
                        
                        {property.propertyType === 'Hotel' && property.totalRooms && (
                          <span className="badge bg-light text-dark border small">
                            <i className="bi bi-door-closed me-1"></i>
                            {property.totalRooms} rooms
                          </span>
                        )}
                        
                        {property.propertyType === 'Shop' && property.businessType && (
                          <span className="badge bg-light text-dark border small">
                            <i className="bi bi-briefcase me-1"></i>
                            {property.businessType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {properties.length > 6 && (
        <div className="text-center mt-4">
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <a href="/rooms" className="btn btn-outline-primary">
              <i className="bi bi-door-open me-2"></i>View All Rooms
            </a>
            <a href="/hotels" className="btn btn-outline-success">
              <i className="bi bi-building me-2"></i>View All Hotels
            </a>
            <a href="/shop" className="btn btn-outline-warning">
              <i className="bi bi-shop me-2"></i>View All Shops
            </a>
          </div>
        </div>
      )}

      {/* Add TopRatedList component */}
      <TopRatedList />
    </div>
  );
};

export default AllPropertiesSection;
