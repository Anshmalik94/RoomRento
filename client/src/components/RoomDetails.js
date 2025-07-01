import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./RoomDetails.css";

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
                <img className="slider-image" src={img} alt={`room ${idx + 1}`} />
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
    </div>
  );
}

export default RoomDetails;
