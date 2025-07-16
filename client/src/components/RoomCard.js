import React from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import './RoomCard.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function RoomCard({ room }) {
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
  const currentUserId = localStorage.getItem("userId");
  const isOwner = currentUserId === room.owner?._id;

  // Placeholder for booking state (replace with actual check later)
  const hasBooked = false;

  const handleEdit = (e) => {
    e.preventDefault();
    window.location.href = `/edit-property/${room._id}`;
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${room._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) window.location.reload();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
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
    <div className="col-lg-4 col-md-6 col-12 mb-4">
      <Link to={`/room/${room._id}`} className="text-decoration-none">
        <div className="card h-100 border-0 shadow-sm room-card"
          style={{ 
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {/* Image */}
          <div className="position-relative overflow-hidden" style={{ height: "200px" }}>
            <img
              src={imageUrl}
              alt={displayTitle}
              className="card-img-top w-100 h-100"
              style={{ 
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-primary text-white fw-semibold px-2 py-1">
                ₹{room.price === 0 ? 'Free' : room.price}
              </span>
            </div>
            {room.owner?.isVerified && (
              <div className="position-absolute top-0 start-0 m-2">
                <span className="badge bg-white text-dark fw-semibold px-2 py-1">
                  <i className="bi bi-patch-check me-1 text-primary"></i>Verified
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="card-body p-3 d-flex flex-column">
            <h5 className="card-title fw-bold mb-2 text-dark" style={{
              fontSize: '1.1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {displayTitle}
            </h5>

            <p className="text-muted small mb-2 d-flex align-items-center">
              <i className="bi bi-geo-alt me-1 text-primary"></i>
              {room.city && room.city !== "N/A" ? room.city : "City not specified"}
            </p>

            {room.roomType && (
              <span className="badge mb-2 align-self-start" style={{
                background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1',
                border: '1px solid #6f42c1'
              }}>
                {room.roomType}
              </span>
            )}

            {room.description && room.description !== "Room" && (
              <p className="text-muted small mb-2" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.4'
              }}>
                {room.description}
              </p>
            )}

            {room.facilities?.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-3">
                {room.facilities.slice(0, 3).map((item, i) => (
                  <span key={i} className="badge small" style={{
                    background: '#f8f9fa', color: '#000',
                    border: '1px solid #dee2e6'
                  }}>
                    {item}
                  </span>
                ))}
                {room.facilities.length > 3 && (
                  <span className="badge small" style={{
                    background: '#f8f9fa', color: '#000',
                    border: '1px solid #dee2e6'
                  }}>
                    +{room.facilities.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-auto" onClick={(e) => e.preventDefault()}>
              {isOwner ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm flex-fill border-0"
                    style={{ background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}
                    onClick={handleEdit}
                  >
                    <i className="bi bi-pencil me-1"></i>Edit
                  </button>
                  <button className="btn btn-sm flex-fill border-0"
                    style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash me-1"></i>Delete
                  </button>
                </div>
              ) : hasBooked ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm flex-fill border-0"
                    style={{ background: '#25d366', color: '#fff' }}
                    onClick={handleWhatsApp}
                  >
                    <i className="bi bi-whatsapp me-1"></i>WhatsApp
                  </button>
                  <button className="btn btn-sm flex-fill border-0"
                    style={{ background: '#6f42c1', color: '#fff' }}
                    onClick={handleCall}
                  >
                    <i className="bi bi-telephone me-1"></i>Call
                  </button>
                </div>
              ) : (
                <Link to={`/room/${room._id}`} 
                  className="btn btn-room w-100 fw-semibold border-0 text-decoration-none"
                >
                  <i className="bi bi-calendar-check me-1"></i>Book Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default RoomCard;
