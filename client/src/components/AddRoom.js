import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";
import MapPicker from "./MapPicker";

function AddRoom({ token }) {
  const [data, setData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    roomType: "",
    furnished: "",
    availableFrom: "",
    pincode: "",
    city: "",
    state: "",
    latitude: "",
    longitude: ""
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handlePincodeDetect = async () => {
    if (!data.pincode) {
      alert("Please enter Pincode first");
      return;
    }

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${data.pincode}`);
      const result = await res.json();

      if (result[0].Status === "Success") {
        const postOffice = result[0].PostOffice[0];
        setData({
          ...data,
          city: postOffice.District,
          state: postOffice.State,
          location: `${postOffice.District}, ${postOffice.State}`
        });
      } else {
        alert("Invalid Pincode or not found");
      }
    } catch (err) {
      console.log(err);
      alert("Failed to fetch address");
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        () => {
          alert("Failed to detect location. Allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!data.latitude || !data.longitude) {
      alert("Please pin location on map.");
      return;
    }

    const confirmAdd = window.confirm("Confirm publishing this room?");
    if (!confirmAdd) return;

    setLoading(true);

    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    Array.from(images).forEach(img => formData.append("images", img));

    try {
      await axios.post(`${BASE_URL}/rooms`, formData, {
        headers: { Authorization: token }
      });
      alert("Room Added!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Failed to add room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-container">
      <form className="add-room-form" onSubmit={handleSubmit}>
        <h2>Add New Room</h2>

        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price (₹)" onChange={handleChange} required />

        <input name="pincode" placeholder="Pincode" onChange={handleChange} required />
        <button type="button" className="detect-btn" onClick={handlePincodeDetect}>Detect City/State</button>

        <input name="location" placeholder="Location" value={data.location} onChange={handleChange} required readOnly />

        <select name="roomType" onChange={handleChange} required>
          <option value="">Room Type</option>
          <option value="Single">Single</option>
          <option value="Shared">Shared</option>
          <option value="Double">Double</option>
          <option value="Normal">Shop</option>
          <option value="Separate">Separate</option>
        </select>

        <select name="furnished" onChange={handleChange} required>
          <option value="">Furnished?</option>
          <option value="Furnished">Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>

        <input name="availableFrom" type="date" onChange={handleChange} required />

        <label className="file-label">
          Upload Images (max 10):
          <input type="file" multiple onChange={e => setImages(e.target.files)} required />
        </label>

        <h4>Pin Room Location on Map:</h4>
        <button type="button" className="detect-btn" onClick={handleUseCurrentLocation}>
          Use Current Location
        </button>

        <MapPicker setLatLng={(latlng) =>
          setData({ ...data, latitude: latlng.lat, longitude: latlng.lng })
        } latitude={data.latitude} longitude={data.longitude} />

        <button type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Publish Now"}
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
