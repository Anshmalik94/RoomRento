import { Link } from "react-router-dom";
import "./RoomCard.css";

function RoomCard({ room }) {
  return (
    <div className="room-card">
      <div className="room-image-container">
        <img src={room.images[0]} alt={room.title} className="room-image" />
      </div>

      <div className="room-details">
        <h3>{room.title}</h3>
        <p className="description">{room.description}</p>
        <p className="location">{room.city}</p>
      </div>

      <div className="room-actions">
        <Link to={`/room/${room._id}`} className="book-now-btn">
          Book Now
        </Link>
      </div>
    </div>
  );
}

export default RoomCard;
