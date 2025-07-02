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
        <p className="price">₹{room.price}</p>
        <p className="location">{room.location}</p>
        <p className={room.available ? "available" : "not-available"}>
          {room.available ? "Available" : "Not Available"}
        </p>
      </div>

      <div className="room-actions">
        <a
          href={`https://wa.me/918920664202`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          WhatsApp
        </a>
        <a href="tel:918920664202" className="call-btn">
          Call
        </a>
        <Link to={`/room/${room._id}`} className="book-now-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default RoomCard;
