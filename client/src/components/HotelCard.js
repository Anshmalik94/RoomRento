/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";
import 'bootstrap-icons/font/bootstrap-icons.css';

function HotelCard({ hotel }) {
  const [imageColor, setImageColor] = useState('light'); // Default to light text

  // Function to detect if image is light or dark
  const getImageBrightness = useCallback((imageSrc) => {
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
        
        setImageColor(isLight ? 'dark' : 'light'); // dark text on light bg, light text on dark bg
      } catch (error) {
        // Fallback to light text if image analysis fails
        setImageColor('light');
      }
    };
    
    img.onerror = function() {
      // Fallback to light text if image fails to load
      setImageColor('light');
    };
    
    img.src = imageSrc;
  }, []);

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

  useEffect(() => {
    const imageUrl = getImageUrl();
    getImageBrightness(imageUrl);
  }, [hotel, getImageUrl, getImageBrightness]); // Add dependencies

  const imageUrl = getImageUrl();
  // const currentUserId = localStorage.getItem("userId");
  // const isOwner = currentUserId === hotel.owner?._id;

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
  //       console.error('Error deleting hotel:', error);
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

  const handleCardClick = () => {
    // Redirect to hotel detail page using room detail route
    window.location.href = `/room/${hotel._id}`;
  };

  return (
    <div 
      className="card h-100 shadow-sm border-0" 
      style={{ 
        borderRadius: '15px', 
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      }}
    >
      {/* Hotel Image */}
      <div className="position-relative" style={{ height: '240px' }}>
        <img
          src={imageUrl}
          alt={hotel.title}
          className="card-img-top w-100 h-100"
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
          }}
          onLoad={() => {
            // Re-analyze image when it loads
            getImageBrightness(imageUrl);
          }}
        />
        
        {/* Category Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-success fs-6 px-3 py-2" style={{ borderRadius: '20px' }}>
            <i className="bi bi-building me-1"></i>{hotel.category}
          </span>
        </div>

        {/* Verified Badge */}
        {hotel.owner?.isVerified && (
          <div className="position-absolute top-0 end-0 m-3">
            <span className="badge bg-primary fs-6 px-3 py-2" style={{ borderRadius: '20px' }}>
              <i className="bi bi-patch-check-fill me-1"></i>Verified
            </span>
          </div>
        )}

        {/* Available Facilities & Amenities Overlay */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="position-absolute bottom-0 start-0 end-0 p-3">
            <div className="d-flex flex-wrap gap-1 mb-2">
              {hotel.amenities.slice(0, 4).map((amenity, index) => {
                const textColor = imageColor === 'dark' ? '#000000' : '#ffffff';
                const shadowColor = imageColor === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                
                return (
                  <span 
                    key={index} 
                    className="small"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '4px 8px',
                      color: textColor,
                      textShadow: `2px 2px 4px ${shadowColor}`
                    }}
                  >
                    {amenity}
                  </span>
                );
              })}
              {hotel.amenities.length > 4 && (
                <span 
                  className="small"
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 8px',
                    color: imageColor === 'dark' ? '#000000' : '#ffffff',
                    textShadow: `2px 2px 4px ${imageColor === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                  }}
                >
                  +{hotel.amenities.length - 4}
                </span>
              )}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              padding: '6px 10px',
              color: imageColor === 'dark' ? '#000000' : '#ffffff',
              textShadow: `2px 2px 4px ${imageColor === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
            }}>
              <i className="bi bi-info-circle me-1"></i>
              Available Facilities & Amenities
            </div>
          </div>
        )}
      </div>

      {/* Hotel Content */}
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="card-title fw-bold mb-0 text-dark" style={{ fontSize: '1.3rem' }}>
            {hotel.title}
          </h5>
        </div>

        {/* Location */}
        <p className="text-muted mb-3 d-flex align-items-center">
          <i className="bi bi-geo-alt-fill me-2 text-success"></i>
          <span className="small">{hotel.location}</span>
        </p>

        {/* Price */}
        <div className="mb-3">
          <span className="h4 mb-0 fw-bold" style={{ color: '#000000' }}>
            ₹{hotel.price?.toLocaleString()}
            <small className="text-muted fs-6 fw-normal">/night</small>
          </span>
        </div>

        {/* Description */}
        <p className="text-muted small mb-3" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.6'
        }}>
          {hotel.description}
        </p>

        {/* Hotel Details */}
        <div className="row g-2 mb-3">
          {hotel.totalRooms && (
            <div className="col-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-door-closed me-2 text-muted"></i>
                <small className="text-muted fw-semibold">{hotel.totalRooms} Rooms</small>
              </div>
            </div>
          )}
          {hotel.checkInTime && (
            <div className="col-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock me-2 text-muted"></i>
                <small className="text-muted fw-semibold">Check-in: {hotel.checkInTime}</small>
              </div>
            </div>
          )}
        </div>

        {/* Room Types */}
        {hotel.roomTypes && hotel.roomTypes.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-1">
              {hotel.roomTypes.slice(0, 3).map((type, index) => (
                <span key={index} className="badge bg-light text-dark border small">
                  {type}
                </span>
              ))}
              {hotel.roomTypes.length > 3 && (
                <span className="badge bg-light text-dark border small">
                  +{hotel.roomTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelCard;
