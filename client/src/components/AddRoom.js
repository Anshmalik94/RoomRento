import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";

function AddRoom({ token }) {
  const [data, setData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    roomType: "",
    furnished: "",
    availableFrom: ""
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

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
        <input name="location" placeholder="Location" onChange={handleChange} required />

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

        <button type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Publish Now"}
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
