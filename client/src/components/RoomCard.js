import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
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

  return (
    <Card 
      className="h-100 border-0 shadow-lg room-card-modern"
      style={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Image Section with Overlays */}
      <div className="position-relative" style={{ height: "280px" }}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={displayTitle}
          className="w-100 h-100"
          style={{ 
            objectFit: "cover",
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
          }}
        />
        
        {/* Gradient Overlay for better text readability */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
            top: 0,
            left: 0
          }}
        />
        
        {/* Property Type Badge - Top Left */}
        <div className="position-absolute top-0 start-0 m-3">
          <Badge 
            className="px-3 py-2 fw-bold text-uppercase"
            style={{
              background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
              border: 'none',
              borderRadius: '25px',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)'
            }}
          >
            {room.type || room.roomType || 'Room'}
          </Badge>
        </div>

        {/* Price Badge - Top Right */}
        <div className="position-absolute top-0 end-0 m-3">
          <Badge 
            className="px-3 py-2 fw-bold"
            style={{
              background: 'rgba(111, 66, 193, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            ₹{room.price === 0 ? 'Free' : room.price?.toLocaleString()}
            <small className="text-white ms-1">/month</small>
          </Badge>
        </div>

        {/* Save Heart Button - Bottom Right of Image */}
        {!isOwner && (
          <button
            className="position-absolute save-heart-modern"
            style={{
              bottom: '12px',
              right: '12px',
              background: isSaved ? '#dc3545' : 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10,
              transform: isToggling ? 'scale(1.2)' : 'scale(1)'
            }}
            onClick={handleSaveToggle}
            disabled={isToggling}
          >
            <i 
              className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`}
              style={{ 
                color: isSaved ? 'white' : '#dc3545',
                fontSize: '20px',
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        )}

        {/* Verification Badge - Bottom Left */}
        {room.owner?.isVerified && (
          <div className="position-absolute bottom-0 start-0 m-3">
            <Badge 
              className="px-2 py-1 fw-semibold d-flex align-items-center"
              style={{
                background: 'rgba(40, 167, 69, 0.95)',
                border: 'none',
                borderRadius: '20px',
                fontSize: '0.75rem'
              }}
            >
              <i className="bi bi-patch-check-fill me-1" style={{ fontSize: '0.8rem' }} />
              Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Card Body */}
      <Card.Body className="p-4 d-flex flex-column">
        {/* Title */}
        <Card.Title 
          className="fw-bold mb-3 text-dark"
          style={{
            fontSize: '1.25rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8rem'
          }}
        >
          {displayTitle}
        </Card.Title>

        {/* Location */}
        <div className="d-flex align-items-center mb-3 text-muted">
          <i className="bi bi-geo-alt-fill me-2" style={{ color: '#6f42c1', fontSize: '1rem' }} />
          <span className="text-truncate" style={{ fontSize: '0.95rem' }}>
            {room.city && room.city !== "N/A" ? room.city : "City not specified"}
          </span>
        </div>

        {/* Features/Amenities */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {room.roomType && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-house me-1" />
              {room.roomType}
            </span>
          )}
          {room.furnished && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-tools me-1" />
              {room.furnished}
            </span>
          )}
          {room.parking && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-car-front me-1" />
              Parking
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          {isOwner ? (
            <div className="row g-2">
              <div className="col-6">
                <button 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(111, 66, 193, 0.1), rgba(111, 66, 193, 0.2))',
                    color: '#6f42c1',
                    border: '1px solid rgba(111, 66, 193, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil-square me-1" />
                  Edit
                </button>
              </div>
              <div className="col-6">
                <button 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.2))',
                    color: '#dc3545',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash3 me-1" />
                  Delete
                </button>
              </div>
            </div>
          ) : hasBooked ? (
            <div className="row g-2">
              <div className="col-6">
                <button 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                  }}
                  onClick={handleWhatsApp}
                >
                  <i className="bi bi-whatsapp me-1" />
                  WhatsApp
                </button>
              </div>
              <div className="col-6">
                <button 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)'
                  }}
                  onClick={handleCall}
                >
                  <i className="bi bi-telephone me-1" />
                  Call
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to={`/room/${room._id}`} 
              className="btn w-100 text-decoration-none d-flex align-items-center justify-content-center"
              style={{
                background: canBeBooked 
                  ? 'linear-gradient(135deg, #6f42c1, #8e44ad)' 
                  : 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: canBeBooked 
                  ? '0 6px 20px rgba(111, 66, 193, 0.4)' 
                  : '0 6px 20px rgba(40, 167, 69, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {canBeBooked ? (
                <>
                  <i className="bi bi-calendar-check-fill me-2" style={{ fontSize: '1.1rem' }} />
                  Book Now
                </>
              ) : (
                <>
                  <i className="bi bi-eye-fill me-2" style={{ fontSize: '1.1rem' }} />
                  View Details
                </>
              )}
            </Link>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default RoomCard;
