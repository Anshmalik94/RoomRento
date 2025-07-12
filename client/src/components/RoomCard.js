import { Link } from "react-router-dom";
import { Card, Button, Badge } from "react-bootstrap";
import "./RoomCard.css";

function RoomCard({ room }) {
  const imageUrl = room?.images?.length > 0 ? room.images[0] : "https://via.placeholder.com/300x220?text=No+Image";
  const displayLocation = room.city || room.location || "N/A";

  return (
    <Card className="room-bootstrap-card shadow-sm mb-4 w-100">
      <div className="overflow-hidden" style={{ height: "220px" }}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={room.title || "Room"}
          className="img-fluid"
          style={{ height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
        />
      </div>

      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title className="fw-bold text-dark text-truncate mb-1">
            {room.title || "Untitled Room"}
          </Card.Title>

          <Card.Text className="text-muted small mb-2">
            {room.description ? room.description.substring(0, 70) + "..." : "No description available."}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary small">
              📍 {displayLocation}
            </span>
            <span className="fw-bold text-danger">
              ₹{room.price || "N/A"}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {room.furnished && <Badge bg="light" text="dark">{room.furnished}</Badge>}
            {room.roomType && <Badge bg="light" text="dark">{room.roomType}</Badge>}
          </div>
        </div>

        <Link to={`/room/${room._id}`} className="mt-3">
          <Button variant="danger" className="w-100 fw-semibold">
            Book Now
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
}

export default RoomCard;
