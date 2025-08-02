import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import './RoomsList.css'; // Reuse existing styles
import TopRatedList from './TopRatedList';
import LoadingSpinner from './LoadingSpinner';

const AllPropertiesSection = ({ filters, token, onLoginRequired }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedProperties, setSavedProperties] = useState(new Set());
  
  const currentUserId = localStorage.getItem("userId");
  const userToken = token || localStorage.getItem("token");

  // Load saved properties from localStorage and listen for changes
  useEffect(() => {
    const updateSavedState = () => {
      if (userToken && currentUserId) {
        const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        setSavedProperties(new Set(saved));
      }
    };

    updateSavedState();

    // Listen for custom events from other components only
    const handleCustomSaveEvent = (event) => {
      if (event.detail && event.detail.propertyId) {
        updateSavedState(); // Refresh entire saved state
      }
    };
    
    window.addEventListener('savedPropertiesChanged', handleCustomSaveEvent);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleCustomSaveEvent);
    };
  }, [userToken, currentUserId]);

  const handleSaveToggle = (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userToken) {
      alert('Please login to save properties');
      return;
    }
    
    const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    let updatedSaved;
    let newSavedState;
    
    if (savedProperties.has(propertyId)) {
      // Remove from saved (unsave) - Heart becomes unfilled
      updatedSaved = saved.filter(id => id !== propertyId);
      newSavedState = false;
      setSavedProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    } else {
      // Add to saved - Heart becomes filled
      if (!saved.includes(propertyId)) {
        updatedSaved = [...saved, propertyId];
        newSavedState = true;
        setSavedProperties(prev => new Set(prev).add(propertyId));
      } else {
        return;
      }
    }
    
    // Remove duplicates and update localStorage
    updatedSaved = [...new Set(updatedSaved)];
    localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
      detail: { propertyId, isSaved: newSavedState }
    }));
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
            return fallback;
          }
          return await response.json();
        } catch (error) {
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
          <LoadingSpinner />
          <p className="mt-3" style={{color: '#6f42c1', fontWeight: '500'}}>Loading properties...</p>
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
    <div id="explore-newly-listed" className="container my-5 all-properties-section" style={{ paddingBottom: '80px' /* Mobile bottom nav space */ }}>
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
            const handlePropertyClick = (property) => {
    // Scroll to top before navigation for better UX
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Small delay to allow scroll to start before navigation
    setTimeout(() => {
      window.location.href = getRedirectUrl(property);
    }, 100);
  };

  const getRedirectUrl = (property) => {
              switch (property.propertyType) {
                case 'Room': return `/room/${property._id}`;
                case 'Hotel': return `/room/${property._id}`; // Hotels use same detail page as rooms
                case 'Shop': return `/room/${property._id}`; // Shops use room details page
                default: return '/';
              }
            };

            return (
              <div key={`${property.propertyType}-${property._id}-${index}`} className="col-lg-4 col-md-6">
                <div className="card h-100 room-card-modern"
                     onClick={() => handlePropertyClick(property)}>
                  <div className="position-relative" style={{ height: '280px', flexShrink: 0, overflow: 'hidden' }}>
                    {/* Image */}
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        className="card-img-top"
                        alt={property.title}
                        style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      />
                    ) : (
                      <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '100%' }}>
                        <i className={`bi ${getPropertyIcon(property.propertyType)} display-4 text-muted`}></i>
                      </div>
                    )}
                    
                    {/* Property Type Badge */}
                    <div className="position-absolute top-0 start-0 m-3">
                      <span 
                        className="badge px-3 py-2 rounded-pill"
                        style={{ 
                          backgroundColor: `${getPropertyColor(property.propertyType)}`, 
                          color: 'white', 
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        <i className={`bi ${getPropertyIcon(property.propertyType)} me-1`}></i>
                        {property.propertyType}
                      </span>
                    </div>

                    {/* Save Heart Icon - Top Right */}
                    {currentUserId !== property.user?._id && userToken && (
                      <button
                        className="position-absolute"
                        style={{
                          top: '12px',
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          zIndex: 10,
                          backdropFilter: 'blur(10px)'
                        }}
                        onClick={(e) => handleSaveToggle(e, property._id)}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.background = 'white';
                          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                      >
                        <i 
                          className={`bi ${savedProperties.has(property._id) ? 'bi-heart-fill' : 'bi-heart'}`}
                          style={{ 
                            color: savedProperties.has(property._id) ? '#ff6b6b' : getPropertyColor(property.propertyType),
                            fontSize: '18px',
                            transition: 'all 0.3s ease'
                          }}
                        ></i>
                      </button>
                    )}

                    {/* Price Badge */}
                    <div className="position-absolute bottom-0 end-0 m-3">
                      <div className="px-3 py-2 rounded-pill d-flex align-items-center"
                           style={{ 
                             background: `linear-gradient(135deg, ${getPropertyColor(property.propertyType)}dd, ${getPropertyColor(property.propertyType)}ee)`,
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255, 255, 255, 0.2)',
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                           }}>
                        <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                          ₹{property.price?.toLocaleString()}
                        </span>
                        <small className="text-white ms-1" style={{ opacity: 0.9 }}>
                          {property.propertyType === 'Room' && '/month'}
                          {property.propertyType === 'Hotel' && '/night'}
                          {property.propertyType === 'Shop' && '/month'}
                        </small>
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="position-absolute bottom-0 start-0 end-0" 
                         style={{
                           height: '100px',
                           background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                           pointerEvents: 'none'
                         }}>
                    </div>
                  </div>
                  
                  <div className="card-body p-4 d-flex flex-column" style={{ flex: 1 }}>
                    <div className="mb-3">
                      <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '1.2rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {property.title}
                      </h5>
                      <div className="d-flex align-items-center text-muted mb-2">
                        <i className="bi bi-geo-alt me-2" style={{ color: getPropertyColor(property.propertyType) }}></i>
                        <span className="text-truncate" style={{ fontSize: '0.95rem' }}>
                          {property.location}
                        </span>
                      </div>
                    </div>
                    
                    <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {property.description?.substring(0, 85) + "..." || "Property available for rent"}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="d-flex flex-wrap gap-2">
                        {property.propertyType === 'Room' && property.roomType && (
                          <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-house me-1"></i>
                            {property.roomType}
                          </span>
                        )}
                        {property.propertyType === 'Hotel' && property.totalRooms && (
                          <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-door-closed me-1"></i>
                            {property.totalRooms} rooms
                          </span>
                        )}
                        {property.propertyType === 'Shop' && property.businessType && (
                          <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-briefcase me-1"></i>
                            {property.businessType}
                          </span>
                        )}
                        {(property.amenities || property.facilities) && (property.amenities || property.facilities).length > 0 && (
                          <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-star me-1"></i>
                            {(property.amenities || property.facilities).length} amenities
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
