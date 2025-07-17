import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
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
  const isOwner = currentUserId === room.user?._id;
  const hasBooked = false; // You can implement this logic
  
  // Check if property can be booked (only Room and Hotel types)
  const canBeBooked = !room.type || ['Room', 'Hotel'].includes(room.type);

  const handleEdit = (e) => {
    e.preventDefault();
    window.location.href = `/edit-room/${room._id}`;
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
      className="h-100 border-0 shadow-sm card-responsive room-card"
      style={{ 
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Image */}
      <div className="position-relative overflow-hidden" style={{ height: "180px" }}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={displayTitle}
          className="w-100 h-100 responsive-image"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <Badge bg="primary" className="text-white fw-semibold px-2 py-1 fs-6">
            ₹{room.price === 0 ? 'Free' : room.price}
          </Badge>
        </div>
        {room.owner?.isVerified && (
          <div className="position-absolute top-0 start-0 m-2">
            <Badge bg="white" className="text-dark fw-semibold px-2 py-1">
              <i className="bi bi-patch-check me-1 text-primary"></i>
              <span className="d-none d-sm-inline">Verified</span>
              <span className="d-sm-none">✓</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Card Body */}
      <Card.Body className="p-3 d-flex flex-column">
        <Card.Title className="fw-bold mb-2 text-dark h6 h5-sm" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {displayTitle}
        </Card.Title>

        <p className="text-muted small mb-2 d-flex align-items-center">
          <i className="bi bi-geo-alt me-1 text-primary"></i>
          <span className="text-truncate">{room.city && room.city !== "N/A" ? room.city : "City not specified"}</span>
        </p>

        {/* Room Type and Features */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          <span className="badge bg-light text-dark border small">
            <i className="bi bi-house me-1"></i>{room.roomType}
          </span>
          {room.furnished && (
            <span className="badge bg-light text-dark border small">
              <i className="bi bi-tools me-1"></i>{room.furnished}
            </span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto">
          {isOwner ? (
            <div className="d-flex gap-2">
              <button className="btn btn-sm flex-fill border-0 btn-responsive"
                style={{ background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}
                onClick={handleEdit}
              >
                <i className="bi bi-pencil me-1"></i>
                <span className="d-none d-sm-inline">Edit</span>
              </button>
              <button className="btn btn-sm flex-fill border-0 btn-responsive"
                style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-1"></i>
                <span className="d-none d-sm-inline">Delete</span>
              </button>
            </div>
          ) : hasBooked ? (
            <div className="d-flex gap-2">
              <button className="btn btn-sm flex-fill border-0 btn-responsive"
                style={{ background: '#25d366', color: '#fff' }}
                onClick={handleWhatsApp}
              >
                <i className="bi bi-whatsapp me-1"></i>
                <span className="d-none d-sm-inline">WhatsApp</span>
              </button>
              <button className="btn btn-sm flex-fill border-0 btn-responsive"
                style={{ background: '#6f42c1', color: '#fff' }}
                onClick={handleCall}
              >
                <i className="bi bi-telephone me-1"></i>
                <span className="d-none d-sm-inline">Call</span>
              </button>
            </div>
          ) : (
            <Link 
              to={`/room/${room._id}`} 
              className="btn btn-room w-100 fw-semibold border-0 text-decoration-none btn-responsive"
              style={{ background: canBeBooked ? '#6f42c1' : '#28a745', color: '#fff' }}
            >
              {canBeBooked ? (
                <>
                  <i className="bi bi-calendar-check me-1"></i>
                  <span className="d-none d-sm-inline">Book Now</span>
                  <span className="d-sm-none">Book</span>
                </>
              ) : (
                <>
                  <i className="bi bi-eye me-1"></i>
                  <span className="d-none d-sm-inline">View Details</span>
                  <span className="d-sm-none">View</span>
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
