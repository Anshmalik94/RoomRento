import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import Slider from "react-slick";
import LoadGoogleMaps from "./LoadGoogleMaps";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./RoomDetails.css";

function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/rooms/${id}`)
      .then(res => setRoom(res.data))
      .catch(err => console.log(err));
  }, [id]);

  useEffect(() => {
    if (room && mapsLoaded && window.google && room.latitude && room.longitude) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: room.latitude, lng: room.longitude },
        zoom: 15,
      });

      markerRef.current = new window.google.maps.Marker({
        position: { lat: room.latitude, lng: room.longitude },
        map: map,
      });
    }
  }, [room, mapsLoaded]);

  if (!room) return <div className="loading">Loading...</div>;

  const settings = {
    dots: true,
    infinite: room.images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="details-container">
      <LoadGoogleMaps onLoad={() => setMapsLoaded(true)} />

      <h2 className="details-title">{room.title}</h2>

      {room.images.length > 0 && (
        <div className="slider-wrapper">
          <Slider {...settings}>
            {room.images.map((img, idx) => (
              <div key={idx} className="slider-img-container">
                <img
                  className="slider-image"
                  src={img}
                  alt={`Room ${idx + 1}`}
                  loading="lazy"
                  style={{ cursor: "pointer" }}
                  onClick={() => window.open(img, "_blank")}
                />
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
          {room.landmark && <div><strong>Landmark:</strong> {room.landmark}</div>}
          {room.address && <div><strong>Address:</strong> {room.address}</div>}
          <div><strong>Type:</strong> {room.roomType}</div>
          <div><strong>Furnished:</strong> {room.furnished}</div>
          {room.pincode && <div><strong>Pincode:</strong> {room.pincode}</div>}
        </div>
      </div>

      {(room.latitude && room.longitude && mapsLoaded) ? (
        <div className="map-wrapper">
          <h3>Room Location:</h3>
          <div 
            ref={mapRef} 
            className="map-container"
          ></div>

          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${room.latitude},${room.longitude}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="navigate-btn"
          >
            Navigate with Google Maps
          </a>
        </div>
      ) : (
        <p style={{ marginTop: "10px" }}>Location not available</p>
      )}

      <div className="contact-buttons">
        <a
          href={`https://wa.me/91${room.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          WhatsApp Owner
        </a>
        <a href={`tel:91${room.phone}`} className="call-btn">
          Call Owner
        </a>
      </div>
    </div>
  );
}

export default RoomDetails;
