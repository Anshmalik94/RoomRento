import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
import { API_URL } from "../config";
import './RoomCard.css'; // Use the same modern styles
import 'bootstrap-icons/font/bootstrap-icons.css';

function HotelCard({ hotel }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  // Check if property is saved on component mount and localStorage changes
  useEffect(() => {
    const updateSavedState = () => {
      if (token && currentUserId) {
        const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        setIsSaved(savedProperties.includes(hotel._id));
      }
    };

    updateSavedState();

    // Listen for custom events from other components only
    const handleCustomSaveEvent = (event) => {
      if (event.detail && event.detail.propertyId === hotel._id) {
        setIsSaved(event.detail.isSaved);
      }
    };
    
    window.addEventListener('savedPropertiesChanged', handleCustomSaveEvent);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleCustomSaveEvent);
    };
  }, [hotel._id, token, currentUserId]);

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
      updatedSaved = savedProperties.filter(id => id !== hotel._id);
      newSavedState = false;
    } else {
      // Add to saved - Heart becomes filled
      if (!savedProperties.includes(hotel._id)) {
        updatedSaved = [...savedProperties, hotel._id];
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
      detail: { propertyId: hotel._id, isSaved: newSavedState }
    }));
    
    // Reset toggling state
    setTimeout(() => setIsToggling(false), 300);
  };

  // Function removed - image brightness detection was not being used
  // const getImageBrightness = useCallback((imageSrc) => { ... }, []);

  // Define getImageUrl function before useEffect
  const getImageUrl = useCallback(() => {
    if (!hotel?.images || hotel.images.length === 0) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    }
    const firstImage = hotel.images[0];
    return firstImage.startsWith('http')
      ? firstImage
      : `${API_URL}/${firstImage}`;
  }, [hotel]);

  // Removed useEffect for image brightness detection as it was not being used

  const imageUrl = getImageUrl();
  const isOwner = currentUserId === hotel.owner?._id;

  // const handleEdit = (e) => {
  //   e.preventDefault();
  //   window.location.href = `/edit-hotel/${hotel._id}`;
  // };

  // const handleDelete = async (e) => {
  //   e.preventDefault();
  //   if (window.confirm('Are you sure you want to delete this hotel?')) {
  //     try {
  //       const res = await fetch(`${API_URL}/api/hotels/${hotel._id}`, {
  //         method: 'DELETE',
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
  //       if (res.ok) window.location.reload();
  //     } catch (error) {

  //     }
  //   }
  // };

  // const handleContact = (e) => {
  //   e.stopPropagation();
  //   window.location.href = `tel:${hotel.contactNumber || '1234567890'}`;
  // };

  // const handleEmail = (e) => {
  //   e.stopPropagation();
  //   window.location.href = `mailto:${hotel.email}`;
  // };

  const getHotelTitle = () => {
    if (hotel.title && hotel.title !== "Hotel") return hotel.title;
    const hotelType = hotel.category || "Hotel";
    const city = hotel.location || "Location";
    if (hotel.description && hotel.description !== "Hotel")
      return `${hotelType} - ${hotel.description}`;
    return `${hotelType} in ${city}`;
  };

  const displayTitle = getHotelTitle();

  const handleEdit = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.location.href = `/edit-hotel/${hotel._id}`;
    }, 100);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      // Delete logic here
    }
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
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
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
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              border: 'none',
              borderRadius: '25px',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
          >
            {hotel.category || 'Hotel'}
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
            ₹{hotel.price === 0 ? 'Free' : hotel.price?.toLocaleString()}
            <small className="text-white ms-1">/night</small>
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
        {hotel.owner?.isVerified && (
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
          <i className="bi bi-geo-alt-fill me-2" style={{ color: '#28a745', fontSize: '1rem' }} />
          <span className="text-truncate" style={{ fontSize: '0.95rem' }}>
            {hotel.location || "Location not specified"}
          </span>
        </div>

        {/* Features/Amenities */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {hotel.totalRooms && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-door-closed me-1" />
              {hotel.totalRooms} Rooms
            </span>
          )}
          {hotel.checkInTime && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-clock me-1" />
              {hotel.checkInTime}
            </span>
          )}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-star me-1" />
              {hotel.amenities.length} Amenities
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
          ) : (
            <Link 
              to={`/room/${hotel._id}`} 
              className="btn w-100 text-decoration-none d-flex align-items-center justify-content-center"
              onClick={(e) => {
                // Check if user is logged in before allowing navigation
                if (!token) {
                  e.preventDefault();
                  alert('Please login to book hotels');
                  return;
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 6px 20px rgba(40, 167, 69, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <i className="bi bi-calendar-check-fill me-2" style={{ fontSize: '1.1rem' }} />
              Book Hotel
            </Link>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default HotelCard;
