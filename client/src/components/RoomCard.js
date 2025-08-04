import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import './RoomCard.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function RoomCard({ room }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  // Check if property is saved on component mount and localStorage changes
  useEffect(() => {
    const updateSavedState = () => {
      if (token && currentUserId) {
        const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        setIsSaved(savedProperties.includes(room._id));
      }
    };

    updateSavedState();

    // Listen for custom events from other components only
    const handleCustomSaveEvent = (event) => {
      // Only update if it's a different property or if it's this property and coming from another component
      if (event.detail && event.detail.propertyId === room._id) {
        setIsSaved(event.detail.isSaved);
      }
    };
    
    window.addEventListener('savedPropertiesChanged', handleCustomSaveEvent);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleCustomSaveEvent);
    };
  }, [room._id, token, currentUserId]);

  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (isToggling) return;
    setIsToggling(true);
    
    if (!token) {
      alert('Please login to save properties');
      setIsToggling(false);
      return;
    }
    
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    let updatedSaved;
    let newSavedState;
    
    if (isSaved) {
      // Remove from saved (unsave) - Heart becomes unfilled
      updatedSaved = savedProperties.filter(id => id !== room._id);
      newSavedState = false;
    } else {
      // Add to saved - Heart becomes filled
      if (!savedProperties.includes(room._id)) {
        updatedSaved = [...savedProperties, room._id];
        newSavedState = true;
      } else {
        setIsToggling(false);
        return;
      }
    }
    
    // Remove duplicates and update localStorage
    updatedSaved = [...new Set(updatedSaved)];
    localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
    
    // Update local state immediately for instant UI feedback
    setIsSaved(newSavedState);
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
      detail: { propertyId: room._id, isSaved: newSavedState }
    }));
    
    // Reset toggling state
    setTimeout(() => setIsToggling(false), 300);
  };
  const getImageUrl = () => {
    if (!room?.images || room.images.length === 0) {
      return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    }
    const firstImage = room.images[0];
    return firstImage.startsWith('http')
      ? firstImage
      : `${API_URL}/${firstImage}`;
  };

  const imageUrl = getImageUrl();

  const getRoomTitle = () => {
    if (room.title && room.title !== "Room") return room.title;
    const roomType = room.roomType || "Room";
    const city = room.city || room.location || "Location";
    if (room.description && room.description !== "Room")
      return `${roomType} - ${room.description}`;
    return `${roomType} in ${city}`;
  };

  const displayTitle = getRoomTitle();
  const isOwner = currentUserId === room.user?._id;
  const hasBooked = false; // You can implement this logic
  
  // Check if property can be booked (only Room and Hotel types)
  const canBeBooked = !room.type || ['Room', 'Hotel'].includes(room.type);

  const handleEdit = (e) => {
    e.preventDefault();
    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay to allow scroll animation to start
    setTimeout(() => {
      window.location.href = `/edit-room/${room._id}`;
    }, 100);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this room?')) {
      // Delete logic here
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${room.owner?.phone || '1234567890'}`, '_blank');
  };

  const handleCall = (e) => {
    e.preventDefault();
    window.location.href = `tel:${room.owner?.phone || '1234567890'}`;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: displayTitle,
      text: `Check out this amazing property: ${displayTitle}`,
      url: `${window.location.origin}/room/${room._id}`
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

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <Link 
        to={`/room/${room._id}`}
        className="text-decoration-none text-dark"
        onClick={(e) => {
          // Check if user is logged in before allowing navigation
          if (!token) {
            e.preventDefault();
            alert('Please login to view room details');
            return;
          }
        }}
      >
        <div className="premium-property-card">
          {/* Image Section with Overlays */}
          <div className="premium-image-container">
            <img
              src={imageUrl}
              alt={displayTitle}
              className="premium-property-image"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            {/* Top Right Actions - Save & Share */}
            <div className="premium-actions-top">
              {!isOwner && (
                <button
                  className="premium-action-btn save-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveToggle(e);
                  }}
                  disabled={isToggling}
                >
                  <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`} 
                     style={{ color: isSaved ? '#FF385C' : '#6f42c1' }} />
                </button>
              )}
              <button
                className="premium-action-btn share-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare(e);
                }}
              >
                <i className="bi bi-share" style={{ color: '#6f42c1' }}></i>
              </button>
            </div>

            {/* Price Badge - Bottom Left */}
            <div className="premium-price-badge">
              ₹{room.price === 0 ? 'Free' : room.price?.toLocaleString()}
              <span className="premium-price-period">/month</span>
            </div>
          </div>

          {/* Card Details */}
          <div className="premium-card-details">
            {/* Title and Rating Row */}
            <div className="premium-title-rating">
              <h3 className="premium-property-title" style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#6f42c1',
                margin: '0 0 12px 0',
                lineHeight: '1.3'
              }}>{displayTitle}</h3>
              <div className="premium-rating">
                <i className="bi bi-star-fill"></i>
                <span className="premium-rating-value">4.8</span>
                <span className="premium-reviews-count">(127)</span>
              </div>
            </div>

            {/* Location */}
            <div className="premium-location">
              <i className="bi bi-geo-alt-fill"></i>
              <span>{room.city && room.city !== "N/A" ? room.city : "Location"}</span>
            </div>

            {/* Property Details in Row Format */}
            <div className="property-details-row">
              <div className="detail-item">
                <i className="bi bi-tag-fill me-1"></i>
                <span className="detail-text">Type: {room.type || 'Room'}</span>
              </div>
              
              {room.roomType && (
                <div className="detail-item">
                  <i className="bi bi-house-door-fill me-1"></i>
                  <span className="detail-text">{room.roomType}</span>
                </div>
              )}
              
              {room.furnished && (
                <div className="detail-item">
                  <i className="bi bi-house-gear-fill me-1"></i>
                  <span className="detail-text">Furnished: {room.furnished}</span>
                </div>
              )}
              
              {room.parking && (
                <div className="detail-item">
                  <i className="bi bi-car-front-fill me-1"></i>
                  <span className="detail-text">Parking: {room.parking === true || room.parking === 'true' ? 'Available' : room.parking}</span>
                </div>
              )}
              
              {room.area && (
                <div className="detail-item">
                  <i className="bi bi-arrows-fullscreen me-1"></i>
                  <span className="detail-text">{room.area} sq ft</span>
                </div>
              )}
              
              {!room.area && (
                <div className="detail-item">
                  <i className="bi bi-arrows-fullscreen me-1"></i>
                  <span className="detail-text">1200 sq ft</span>
                </div>
              )}
            </div>

            {/* Action Button or Owner Controls */}
            <div className="premium-action-section">
              {isOwner ? (
                <div className="premium-owner-actions">
                  <button 
                    className="premium-btn premium-btn-edit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(e);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                    Edit
                  </button>
                  <button 
                    className="premium-btn premium-btn-delete"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(e);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                    Delete
                  </button>
                </div>
              ) : hasBooked ? (
                <div className="premium-contact-actions">
                  <button 
                    className="premium-btn premium-btn-whatsapp"
                    onClick={(e) => {
                      e.preventDefault();
                      handleWhatsApp(e);
                    }}
                  >
                    <i className="bi bi-whatsapp"></i>
                    WhatsApp
                  </button>
                  <button 
                    className="premium-btn premium-btn-call"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCall(e);
                    }}
                  >
                    <i className="bi bi-telephone"></i>
                    Call
                  </button>
                </div>
              ) : (
                <button className="premium-btn premium-btn-primary">
                  <i className="bi bi-calendar-check"></i>
                  {canBeBooked ? 'Book Now' : 'View Details'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default RoomCard;
