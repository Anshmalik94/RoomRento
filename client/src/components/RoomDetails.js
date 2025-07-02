import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import Slider from "react-slick";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./RoomDetails.css";

// Default Marker Fix (Leaflet ke icon ke liye)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/rooms/${id}`)
      .then(res => setRoom(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!room) return <div className="loading">Loading...</div>;

  const settings = {
    dots: true,
    infinite: room.images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="details-container">
      <h2 className="details-title">{room.title}</h2>

      {room.images.length > 0 && (
        <div className="slider-wrapper">
          <Slider {...settings}>
            {room.images.map((img, idx) => (
              <div key={idx} className="slider-img-container">
                {/* alt attribute me redundant words hata diye */}
                <img className="slider-image" src={img} alt={`Room ${idx + 1}`} loading="lazy" />
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className="details-info">
        <p className="description">{room.description}</p>
        <div className="info-grid">
          <div><strong>Price:</strong> ₹{room.price}</div>
          <div><strong>Location:</strong> {room.location}</div>
          <div><strong>Type:</strong> {room.roomType}</div>
          <div><strong>Furnished:</strong> {room.furnished}</div>
          <div><strong>Available From:</strong> {room.availableFrom}</div>
        </div>
      </div>

      {room.latitude && room.longitude && (
        <div className="map-wrapper">
          <h3>Room Location:</h3>
          <MapContainer center={[room.latitude, room.longitude]} zoom={15} style={{ height: "300px", width: "100%", marginTop: "10px" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[room.latitude, room.longitude]} />
          </MapContainer>

          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${room.latitude},${room.longitude}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="navigate-btn"
          >
            Navigate with Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default RoomDetails;
