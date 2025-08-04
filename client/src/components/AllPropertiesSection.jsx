import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import './RoomsList.css'; // Reuse existing styles
import './RoomCard.css'; // Premium card styles
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

  const handleShare = async (e, property) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: property.title,
      text: `Check out this amazing ${property.propertyType.toLowerCase()}: ${property.title}`,
      url: `${window.location.origin}/room/${property._id}`
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        
        // Show a toast or alert
        const toast = document.createElement('div');
        toast.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #28a745; 
            color: white; 
            padding: 12px 20px; 
            border-radius: 8px; 
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            <i class="bi bi-check-circle me-2"></i>
            Link copied to clipboard!
          </div>
        `;
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
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
          <h2 className="fw-bold mb-3" style={{ 
            fontSize: '2.5rem', 
            color: '#222',
            letterSpacing: '-0.5px',
            marginBottom: '1rem'
          }}>
            Explore Newly Listed
          </h2>
          <p className="text-muted lead mb-0" style={{ 
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Discover the latest rooms, hotels, and shops available for rent
          </p>
          <div className="mx-auto mt-3" style={{
            width: '60px',
            height: '4px',
            background: 'linear-gradient(45deg, #6f42c1, #8e44ad)',
            borderRadius: '2px'
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
              // Check if user is logged in before allowing navigation
              if (!userToken) {
                // Show login modal if onLoginRequired is provided
                if (onLoginRequired) {
                  onLoginRequired();
                }
                return;
              }
              
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
              <div key={`${property.propertyType}-${property._id}-${index}`} className="col-lg-4 col-md-6 mb-4">
                <div className="premium-property-card"
                     onClick={() => handlePropertyClick(property)}>
                  <div className="premium-image-container">
                    {/* Image */}
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        className="premium-property-image"
                        alt={property.title}
                      />
                    ) : (
                      <div className="premium-property-image d-flex align-items-center justify-content-center bg-light">
                        <i className={`bi ${getPropertyIcon(property.propertyType)} display-4 text-muted`}></i>
                      </div>
                    )}
                    
                    {/* Top Left - Property Type Badge */}
                    <div className="premium-actions-top-left">
                      <span 
                        className="premium-type-badge"
                        style={{ 
                          backgroundColor: `${getPropertyColor(property.propertyType)}`, 
                        }}
                      >
                        <i className={`bi ${getPropertyIcon(property.propertyType)} me-1`}></i>
                        {property.propertyType}
                      </span>
                    </div>
                    
                    {/* Top Right Actions */}
                    <div className="premium-actions-top">
                      {/* Save Heart Icon */}
                      {currentUserId !== property.user?._id && userToken && (
                        <button
                          className="premium-action-btn save-btn"
                          onClick={(e) => handleSaveToggle(e, property._id)}
                        >
                          <i 
                            className={`bi ${savedProperties.has(property._id) ? 'bi-heart-fill' : 'bi-heart'}`}
                          ></i>
                        </button>
                      )}

                      {/* Share Button */}
                      <button
                        className="premium-action-btn share-btn"
                        onClick={(e) => handleShare(e, property)}
                      >
                        <i className="bi bi-share"></i>
                      </button>
                    </div>

                    {/* Price Badge */}
                    <div className="premium-price-badge">
                      <span className="premium-price-amount">
                        ₹{property.price?.toLocaleString()}
                      </span>
                      <span className="premium-price-period">
                        {property.propertyType === 'Room' && '/month'}
                        {property.propertyType === 'Hotel' && '/night'}
                        {property.propertyType === 'Shop' && '/month'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="premium-card-details">
                    <div className="premium-title-rating">
                      <h3 className="premium-property-title" style={{ 
                        display: 'block !important',
                        visibility: 'visible !important',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#6f42c1 !important',
                        margin: '0 0 12px 0',
                        lineHeight: '1.3'
                      }}>
                        {property.title || property.name || `${property.propertyType} Available in ${property.location}` || 'Property Available for Rent'}
                      </h3>
                    </div>
                    
                    <div className="premium-location">
                      <i className="bi bi-geo-alt"></i>
                      <span>{property.location}</span>
                    </div>
                    
                    {/* Property Details in Row Format like Image */}
                    <div className="property-details-row mt-3 mb-2">
                      <div className="detail-item">
                        <i className="bi bi-tag-fill me-1"></i>
                        <span className="detail-text">Type: {property.propertyType}</span>
                      </div>
                      
                      {property.propertyType === 'Room' && property.roomType && (
                        <div className="detail-item">
                          <i className="bi bi-house-door me-1"></i>
                          <span className="detail-text">{property.roomType}</span>
                        </div>
                      )}
                      
                      {property.propertyType === 'Room' && property.furnished && (
                        <div className="detail-item">
                          <i className="bi bi-house-gear-fill me-1"></i>
                          <span className="detail-text">Furnished: {property.furnished}</span>
                        </div>
                      )}
                      
                      {property.propertyType === 'Hotel' && property.totalRooms && (
                        <div className="detail-item">
                          <i className="bi bi-door-closed-fill me-1"></i>
                          <span className="detail-text">{property.totalRooms} rooms</span>
                        </div>
                      )}
                      
                      {property.propertyType === 'Shop' && property.businessType && (
                        <div className="detail-item">
                          <i className="bi bi-briefcase-fill me-1"></i>
                          <span className="detail-text">{property.businessType}</span>
                        </div>
                      )}
                      
                      {property.parking && (
                        <div className="detail-item">
                          <i className="bi bi-car-front-fill me-1"></i>
                          <span className="detail-text">Parking: {property.parking === true || property.parking === 'true' ? 'Available' : property.parking}</span>
                        </div>
                      )}
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
      <TopRatedList 
        token={userToken}
        onLoginRequired={onLoginRequired}
      />
    </div>
  );
};

export default AllPropertiesSection;
