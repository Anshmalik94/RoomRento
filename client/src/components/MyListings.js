import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
import LoadingSpinner from "./LoadingSpinner";
import "./MyListings.css";

function MyListings() {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyProperties = async () => {
      setLoading(true);
      try {
        const [roomsRes, shopsRes, hotelsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/rooms/my-listings`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BASE_URL}/api/shops/my-listings`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })), // fallback if shops API fails
          axios.get(`${BASE_URL}/api/hotels/my-listings`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })) // fallback if hotels API fails
        ]);
        const rooms = (roomsRes.data || []).map(r => ({ ...r, propertyType: 'Room' }));
        const shops = (shopsRes.data || []).map(s => ({ ...s, propertyType: 'Shop' }));
        const hotels = (hotelsRes.data || []).map(h => ({ ...h, propertyType: 'Hotel' }));
        setMyProperties([...rooms, ...shops, ...hotels]);
      } catch (err) {
        console.error("Error fetching my properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, [token]);

  const toggleVisibility = async (propertyId, currentStatus) => {
    try {
      await axios.patch(`${BASE_URL}/api/rooms/${propertyId}/toggle-visibility`, 
        { isVisible: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setMyProperties(prev => 
        prev.map(property => 
          property._id === propertyId 
            ? { ...property, isVisible: !currentStatus }
            : property
        )
      );
    } catch (err) {
      console.error("Error toggling visibility:", err);
      alert("Failed to update visibility");
    }
  };

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading your listings..." />;
  }

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4">My Listings</h2>
      {myProperties.length === 0 ? (
        <div className="alert alert-info">
          <h4>You haven't listed any properties yet.</h4>
          <p>Start by adding your first property!</p>
          <Link to="/add-property" className="btn btn-primary">Rentify</Link>
        </div>
      ) : (
        <div className="row">
          {myProperties.map((property) => (
            <div className="col-md-6 col-lg-4 mb-4" key={property._id}>
              <div className="card property-card">
                <div className="position-relative">
                  <img
                    src={property.images?.[0] || "https://via.placeholder.com/300x200"}
                    className="card-img-top"
                    alt={property.title}
                    style={{ height: "200px", objectFit: "cover" }}
                    loading="lazy"
                  />
                  {property.propertyType === 'Room' && (
                    <div className={`visibility-badge ${property.isVisible ? 'visible' : 'hidden'}`}>
                      {property.isVisible ? 'Live' : 'Hidden'}
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    {property.title}
                    {property.user && property.user.isVerified && (
                      <Badge bg="success" className="ms-2">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Verified Owner
                      </Badge>
                    )}
                    <span className="badge bg-secondary ms-2">{property.propertyType}</span>
                  </h5>
                  <p className="card-text text-muted">
                    📍 {property.city || property.location}
                  </p>
                  <p className="card-text">
                    <strong>₹{property.price}</strong> / month
                  </p>
                  {property.propertyType === 'Shop' && (
                    <>
                      <p className="card-text mb-1"><b>Business Type:</b> {property.businessType}</p>
                      <p className="card-text mb-1"><b>Area:</b> {property.shopArea} sq.ft.</p>
                    </>
                  )}
                  {property.propertyType === 'Hotel' && (
                    <>
                      <p className="card-text mb-1"><b>Star Rating:</b> {property.starRating} stars</p>
                      <p className="card-text mb-1"><b>Amenities:</b> {property.amenities.join(', ')}</p>
                    </>
                  )}
                  <div className="d-flex justify-content-between align-items-center">
                    {property.propertyType === 'Room' ? (
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={property.isVisible || false}
                          onChange={() => toggleVisibility(property._id, property.isVisible)}
                        />
                        <label className="form-check-label">
                          {property.isVisible ? 'Visible' : 'Hidden'}
                        </label>
                      </div>
                    ) : (
                      <div className="text-muted small">Visibility toggle not available for shops</div>
                    )}
                    <Link 
                      to={`/edit-property/${property._id}`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListings;
