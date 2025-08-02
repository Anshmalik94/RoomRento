import React from "react";
import "./RoomCardSection.css";

const RoomCardSection = () => {
  return (
    <div className="room-card-section d-flex flex-column justify-content-center align-items-center">
      {/* Horizontal Advertisement - Above Room Image */}
      <div className="roomrento-horizontal-ad mb-4">
        <div className="horizontal-ad-container">
          <div className="ad-content">
            <div className="ad-icon">
              <i className="bi bi-house-heart-fill"></i>
            </div>
            <div className="ad-text">
              <div className="ad-title">Find Your Perfect Room</div>
              <div className="ad-subtitle">Premium accommodations at affordable prices</div>
            </div>
            <div className="ad-action">
              <button className="btn-explore">
                <i className="bi bi-arrow-right-circle-fill me-1"></i>
            Just Book Now 
              </button>
            </div>
          </div>
          <div className="ad-sparkles">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">⭐</div>
            <div className="sparkle sparkle-3">💫</div>
          </div>
        </div>
      </div>
      
      <div className="room-card-wrapper">
        <div className="room-image-container">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Room"
            className="main-room-img"
          />
          <div className="room-thumb thumb-1">
            <img
              src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80"
              alt="Living Room"
            />
          </div>
          <div className="room-thumb thumb-2">
            <img
              src="https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=400&q=80"
              alt="Front View"
            />
          </div>
          <div className="room-info-overlay">
            <div className="room-price">Starting at ₹1999/</div>
            <div className="room-location">
              <i className="bi bi-geo-alt-fill me-1"></i>Downtown District
            </div>
            <div className="room-details">
              <span><i className="bi bi-house-door me-1"></i>All Type Of Room</span>
              <span className="mx-2">|</span>
              <span><i className="bi bi-bathtub me-1"></i>Also avail for Shared Rooms</span>
            </div>
          </div>
        </div>
        <div className="agent-card d-flex align-items-center shadow-sm">
        <img
  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  alt="Room"
  className="agent-photo"
/>
          <div className="agent-info ms-3">
            <div className="agent-name fw-semibold">Kumar Sanjeev Mishra</div>
            <div className="agent-role text-muted small">Senior Room Advisor</div>
            <div className="agent-rating d-flex align-items-center mt-1">
              <i className="bi bi-star-fill text-warning me-1"></i>
              <span className="fw-semibold">5.0</span>
              <span className="text-muted small ms-1">(94 reviews)</span>
            </div>
          </div>
          <div className="ms-auto">
            <button className="btn btn-light agent-chat-btn rounded-circle shadow-sm">
              <i className="bi bi-chat-dots-fill text-success"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCardSection;
