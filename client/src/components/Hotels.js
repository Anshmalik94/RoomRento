import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import HotelCard from "./HotelCard";
import LoadingSpinner from "./LoadingSpinner";
import "./RoomsList.css";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hotels`);
      // Check if response has hotels array (paginated) or is direct array
      const hotelsData = res.data.hotels || res.data;
      setHotels(hotelsData);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      // Set empty array if API fails
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="section-header mb-4">
        <i className="bi bi-building" style={{color: '#6f42c1'}}></i>
        <h2 className="mb-0" style={{color: '#6f42c1'}}>Available Hotels</h2>
      </div>
      {hotels.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-building-x" style={{fontSize: '4rem', color: '#6f42c1', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#6f42c1'}}>No Hotels Available</h3>
          <p className="text-muted mb-4 lead">
            Currently, there are no hotels listed on our platform.
          </p>
          {localStorage.getItem("role") === "owner" && (
            <div className="bg-light p-4 rounded-4 d-inline-block">
              <p className="mb-3">
                <strong>Are you a hotel owner?</strong><br/>
                List your hotel and start welcoming guests today!
              </p>
              <button 
                className="btn btn-lg px-4"
                style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                onClick={() => window.location.href = '/add-hotel'}
              >
                <i className="bi bi-plus-circle me-2"></i>
                List Your Hotel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {hotels.map((hotel) => (
            <div className="col-lg-4 col-md-6 col-12" key={hotel._id}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hotels;
