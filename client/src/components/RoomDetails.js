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
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="details-container">
      <h2 className="details-title">{room.title}</h2>

      <div className="slider-wrapper">
        <Slider {...settings}>
          {room.images.map((img, idx) => (
            <div key={idx}>
              <img className="slider-image" src={img} alt="room" />
            </div>
          ))}
        </Slider>
      </div>

      <div className="details-info">
        <p>{room.description}</p>
        <p><strong>Price:</strong> ₹{room.price}</p>
        <p><strong>Location:</strong> {room.location}</p>
        <p><strong>Type:</strong> {room.roomType}</p>
        <p><strong>Furnished:</strong> {room.furnished}</p>
        <p><strong>Available From:</strong> {room.availableFrom}</p>
      </div>
    </div>
  );
}

export default RoomDetails;
