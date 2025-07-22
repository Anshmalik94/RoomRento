import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TopRatedList.css';

const TopRatedList = () => {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/rooms`);
        console.log('API Response:', response.data);
        setListings(response.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        if (err.response) {
          console.error('Response Data:', err.response.data);
          console.error('Response Status:', err.response.status);
          console.error('Response Headers:', err.response.headers);
        } else if (err.request) {
          console.error('Request Data:', err.request);
        } else {
          console.error('Error Message:', err.message);
        }
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (error) {
    return <div className="alert alert-danger text-center my-4">{error}</div>;
  }

  if (loading) {
    return <div className="text-center my-4">Loading...</div>;
  }

  if (listings.length === 0) {
    return <div className="text-center my-4">No listings found.</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-center">Top Rated Listing</h2>
      <div className="d-flex overflow-auto" style={{ gap: '1rem', padding: '1rem 0' }}>
        {listings.map((listing) => (
          <div
            key={listing._id}
            className="card flex-shrink-0 shadow-sm border-0 rounded"
            style={{ width: '200px', minWidth: '200px', transition: 'all 0.3s ease', cursor: 'pointer' }}
            onClick={() => {
              const redirectUrl = `/room/${listing._id}`;
              window.location.href = redirectUrl;
            }}
          >
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                className="card-img-top"
                alt={listing.title}
                style={{ height: '100px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="card-img-top d-flex align-items-center justify-content-center bg-light"
                style={{ height: '100px' }}
              >
                <i className="bi bi-image display-4 text-muted"></i>
              </div>
            )}
            <div className="card-body">
              <h5 className="card-title fw-bold mb-2" style={{ fontSize: '0.9rem' }}>{listing.title}</h5>
              <p className="card-text text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                {listing.location || listing.propertyType}
              </p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                  {listing.rating || 'Highly Rated'}
                </span>
                <span className="fw-bold text-end" style={{ fontSize: '0.8rem' }}>
                  ₹{listing.price?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatedList;
