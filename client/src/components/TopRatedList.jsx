import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TopRatedList.css';

const TopRatedList = ({ token, onLoginRequired }) => {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const userToken = token || localStorage.getItem("token");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/rooms`, {
          timeout: 10000 // 10 second timeout
        });
        // Filter for highly rated properties or just show available ones
        const validListings = Array.isArray(response.data) ? response.data : [];
        setListings(validListings);
      } catch (err) {
        console.error('TopRatedList Error:', err);
        
        // More specific error handling
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection.');
        } else if (err.response?.status === 404) {
          setError('Service not available.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else if (!navigator.onLine) {
          setError('No internet connection.');
        } else {
          // For development, be less alarming
          setListings([]); // Just show empty instead of error
          setError(null);
        }
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
      <h2 className="fw-bold mb-4 text-center text-dark">Top Rated Properties</h2>
      <div className="d-flex overflow-auto" style={{ gap: '1.5rem', padding: '1rem 0' }}>
        {listings.map((listing) => (
          <div
            key={listing._id}
            className="card flex-shrink-0 shadow-sm border-0 rounded-3 top-rated-card"
            style={{ 
              width: '220px', 
              minWidth: '220px', 
              transition: 'all 0.3s ease', 
              cursor: 'pointer',
              borderRadius: '16px'
            }}
            onClick={() => {
              // Check if user is logged in before allowing navigation
              if (!userToken) {
                // Show login modal if onLoginRequired is provided
                if (onLoginRequired) {
                  onLoginRequired();
                }
                return;
              }
              
              // Scroll to top before navigation for better UX
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              
              // Small delay to allow scroll to start before navigation
              setTimeout(() => {
                const redirectUrl = `/room/${listing._id}`;
                window.location.href = redirectUrl;
              }, 100);
            }}
          >
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                className="card-img-top"
                alt={listing.title}
                style={{ 
                  height: '140px', 
                  objectFit: 'cover',
                  borderRadius: '16px 16px 0 0'
                }}
              />
            ) : (
              <div
                className="card-img-top d-flex align-items-center justify-content-center bg-light"
                style={{ 
                  height: '140px',
                  borderRadius: '16px 16px 0 0'
                }}
              >
                <i className="bi bi-image display-4 text-muted"></i>
              </div>
            )}
            <div className="card-body" style={{ padding: '1rem' }}>
              <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.3' }}>
                {listing.title}
              </h5>
              <p className="card-text text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-geo-alt me-1"></i>
                {listing.city || listing.location || listing.propertyType}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-success px-2 py-1" style={{ fontSize: '0.7rem', borderRadius: '8px' }}>
                  <i className="bi bi-star-fill me-1"></i>
                  {listing.rating || '4.5'}
                </span>
                <div className="text-end">
                  <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    ₹{listing.price?.toLocaleString() || 'N/A'}
                  </span>
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                    per month
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatedList;
