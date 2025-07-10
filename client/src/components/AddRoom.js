import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";
import LoadGoogleMaps from "./LoadGoogleMaps";
import MapPicker from "./MapPicker";

function AddRoom({ token }) {
  const [data, setData] = useState({
    title: "",
    description: "",
    price: "",
    phone: "",
    location: "",
    roomType: "",
    furnished: "",
    pincode: "",
    city: "",
    state: "",
    landmark: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const safeValue = (val) => (val === undefined || val === null ? "" : val);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    alert("Detecting your location... please wait.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Google Maps Geocoding API se address aur pincode nikaalo
          // React me env variable sahi se use karne ke liye import karo
          const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
          if (!GOOGLE_API_KEY) {
            alert('Google Maps API key missing! Client ke root me .env file banao aur key daalo.');
            return;
          }
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
          );
          const geoData = await geoRes.json();
          console.log('Google Geocoding API result:', geoData);

          let address = "";
          let city = "";
          let state = "";
          let pincode = "";

          if (geoData.results && geoData.results.length > 0) {
            const components = geoData.results[0].address_components;
            address = geoData.results[0].formatted_address || "";
            for (const comp of components) {
              if (comp.types.includes("postal_code")) {
                pincode = comp.long_name;
              }
              if (comp.types.includes("locality")) {
                city = comp.long_name;
              }
              if (comp.types.includes("administrative_area_level_1")) {
                state = comp.long_name;
              }
            }
          }

          setData((prev) => ({
            ...prev,
            latitude,
            longitude,
            address: address,
            city: city,
            state: state,
            location: city && state ? `${city}, ${state}` : "",
            pincode: pincode,
          }));

          alert("Location detected and all fields auto-filled!");
        } catch (error) {
          console.log(error);
          alert("Location detected but failed to fetch full address.");
        }
      },
      (error) => {
        console.log(error);
        alert("Failed to detect location. Please allow location access and ensure GPS is turned on.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapsLoad = () => {
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        setMapsLoaded(true);
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.latitude || !data.longitude) {
      alert("Please pin location on map.");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const confirmAdd = window.confirm("Confirm publishing this room?");
    if (!confirmAdd) return;

    setLoading(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    Array.from(images).forEach((img) => formData.append("images", img));

    try {
      await axios.post(`${BASE_URL}/rooms`, formData, {
        headers: { Authorization: token },
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
      <LoadGoogleMaps onLoad={handleMapsLoad} />
      <form className="add-room-form" onSubmit={handleSubmit}>
        <h2>Add New Room</h2>

        <input
          name="title"
          placeholder="Title"
          value={safeValue(data.title)}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={safeValue(data.description)}
          onChange={handleChange}
          required
        />

        <div className="flex-group">
          <input
            name="pincode"
            placeholder="Pincode"
            value={safeValue(data.pincode)}
            onChange={handleChange}
            required
            readOnly
          />
          <input
            name="landmark"
            placeholder="Landmark"
            value={safeValue(data.landmark)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex-group">
          <input
            name="city"
            placeholder="City"
            value={safeValue(data.city)}
            onChange={handleChange}
            required
            readOnly
          />
          <input
            name="state"
            placeholder="State"
            value={safeValue(data.state)}
            onChange={handleChange}
            required
            readOnly
          />
        </div>

        <input
          name="address"
          placeholder="House No., Area, Street, Gali Number"
          value={safeValue(data.address)}
          onChange={handleChange}
          required
        />

        <div className="flex-group">
          <input
            name="phone"
            placeholder="Phone Number"
            value={safeValue(data.phone)}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price (₹)"
            value={safeValue(data.price)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex-group">
          <select
            name="roomType"
            value={safeValue(data.roomType)}
            onChange={handleChange}
            required
          >
            <option value="">Room Type</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
            <option value="Double">Double</option>
            <option value="Normal">Shop</option>
            <option value="Separate">Separate</option>
          </select>

          <select
            name="furnished"
            value={safeValue(data.furnished)}
            onChange={handleChange}
            required
          >
            <option value="">Furnished?</option>
            <option value="Furnished">Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        <label className="file-label">
          Upload Images (max 10):
          <input
            type="file"
            multiple
            onChange={(e) => setImages(e.target.files)}
            required
          />
        </label>

        <h4>Pin Room Location on Map:</h4>
        <button type="button" className="detect-btn" onClick={handleUseCurrentLocation}>
          Use My Current Location
        </button>

        {mapsLoaded ? (
          <MapPicker
            setLatLng={(latlng) =>
              setData((prev) => ({
                ...prev,
                latitude: latlng.lat,
                longitude: latlng.lng,
              }))
            }
            latitude={data.latitude}
            longitude={data.longitude}
          />
        ) : (
          <p>Loading map...</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Publish Now"}
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
