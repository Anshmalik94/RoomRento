import { Link } from "react-router-dom";
import { Card, Button, Badge } from "react-bootstrap";
import "./RoomCard.css";

function RoomCard({ room }) {
  return (
    <Card className="room-bootstrap-card shadow-sm mb-4 w-100">
      <div className="overflow-hidden" style={{ height: "220px" }}>
        <Card.Img
          variant="top"
          src={room.images[0]}
          alt={room.title}
          className="img-fluid"
          style={{ height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
        />
      </div>

      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title className="fw-bold text-dark text-truncate mb-1">{room.title}</Card.Title>
          <Card.Text className="text-muted small mb-2">
            {room.description?.substring(0, 70)}...
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary small">
              📍 {room.city || "N/A"}
            </span>
            <span className="fw-bold text-danger">₹{room.price}</span>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark">{room.furnished}</Badge>
            <Badge bg="light" text="dark">{room.roomType}</Badge>
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
