import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './RoomSearchForm.css';
import { SITE_STATISTICS } from '../config/statistics';

function RoomSearchForm({ filters, onSubmit, token, onLoginRequired }) {
  const [formFilters, setFormFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem('roomFilters');
    return savedFilters ? JSON.parse(savedFilters) : (filters || {
      propertyType: 'Room', // Default to Room
      location: '',
      budget: '',
      roomCategory: '',
      nearby: false
    });
  });
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('roomFilters', JSON.stringify(formFilters));
  }, [formFilters]);

  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 2000);
        }
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine destination route based on property type
    let destinationRoute = '/rooms'; // default
    if (formFilters.propertyType === 'Hotel') {
      destinationRoute = '/hotels';
    } else if (formFilters.propertyType === 'Shop') {
      destinationRoute = '/shop';
    }
    
    // Prepare search parameters - only include non-empty values
    const searchParams = new URLSearchParams();
    
    Object.entries(formFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        searchParams.append(key, value);
      }
    });
    
    // Always add filtered=true to indicate this is a filtered search
    searchParams.append('filtered', 'true');
    
    const queryString = searchParams.toString();
    navigate(`${destinationRoute}?${queryString}`);
  };

  const handleNearMe = () => {
    // Check if user is logged in
    if (!token) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Navigate to rooms page with coordinates
          navigate(`/rooms?lat=${latitude}&lng=${longitude}&nearby=true`);
        },
        (error) => {
          let errorMessage = 'Location access denied or not available';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permission and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try again later.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting your location.';
              break;
          }
          
          alert(errorMessage);
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  return (
    <>
      <section
        id="room-search-section"
        ref={sectionRef}
        className={`room-search-form-section py-5 ${
          animate ? 'zoom-highlight' : ''
        }`}
        style={{ 
          background: 'transparent', 
          backgroundColor: 'transparent',
          backgroundImage: 'none'
        }}
      >
        <div className="container-fluid">
          <div className="row justify-content-center">
            {/* Main Search Form */}
            <div className="col-lg-12 col-xl-10 d-flex justify-content-center">
              <div
                className="room-search-form-card shadow rounded-4 p-4 w-100"
                style={{ 
                  maxWidth: 1000,
                  background: '#ffffff',
                  backgroundColor: '#ffffff'
                }}
              >
          <h3 className="fw-bold text-center mb-1">Start Your Room Search</h3>
          <p className="text-center text-muted mb-4">
            Discover thousands of verified room listings
          </p>
          
          {/* Active Filters Display */}
          {(formFilters.propertyType !== 'Room' || formFilters.location || formFilters.budget || formFilters.roomCategory || formFilters.nearby) && (
            <div className="mb-3 p-2 bg-light rounded">
              <small className="text-muted d-block mb-1">Active Filters:</small>
              <div className="d-flex flex-wrap gap-1">
                {formFilters.propertyType !== 'Room' && (
                  <span className="badge bg-dark">{formFilters.propertyType}</span>
                )}
                {formFilters.location && (
                  <span className="badge bg-primary">{formFilters.location}</span>
                )}
                {formFilters.budget && (
                  <span className="badge bg-warning text-dark">Up to ₹{formFilters.budget}</span>
                )}
                {formFilters.roomCategory && (
                  <span className="badge bg-info">{formFilters.roomCategory}</span>
                )}
                {formFilters.nearby && (
                  <span className="badge bg-secondary">Near Me</span>
                )}
                <button 
                  type="button" 
                  className="badge bg-danger border-0" 
                  onClick={() => {
                    setFormFilters({
                      propertyType: 'Room',
                      location: '',
                      budget: '',
                      roomCategory: '',
                      nearby: false
                    });
                    sessionStorage.removeItem('roomFilters');
                  }}
                  style={{cursor: 'pointer'}}
                >
                  Clear All ×
                </button>
              </div>
            </div>
          )}
          
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            {/* Property Type Selector */}
            <div className="col-md-6">
              <label htmlFor="propertyType" className="form-label fw-semibold">Property Type</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-house"></i></span>
                <select
                  className="form-select"
                  id="propertyType"
                  name="propertyType"
                  value={formFilters.propertyType}
                  onChange={handleChange}
                >
                  <option value="Room">Room</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Shop">Shop</option>
                </select>
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="col-md-6">
              <label htmlFor="location" className="form-label fw-semibold">Location</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-geo-alt"></i></span>
                <select
                  className="form-select"
                  id="location"
                  name="location"
                  value={formFilters.location}
                  onChange={handleChange}
                >
                  <option value="">Select City</option>
                  <option value="Noida">Noida</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gurgaon">Gurgaon</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Greater Noida">Greater Noida</option>
                </select>
              </div>
            </div>

            {/* Budget Range Field */}
            <div className="col-md-6">
              <label htmlFor="budget" className="form-label">Budget Range</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-currency-rupee"></i></span>
                <select
                  className="form-select"
                  id="budget"
                  name="budget"
                  value={formFilters.budget}
                  onChange={handleChange}
                >
                  <option value="">Any Price</option>
                  <option value="0-2000">₹0 - ₹2,000</option>
                  <option value="2000-5000">₹2,000 - ₹5,000</option>
                  <option value="5000-8000">₹5,000 - ₹8,000</option>
                  <option value="8000-12000">₹8,000 - ₹12,000</option>
                  <option value="12000-20000">₹12,000 - ₹20,000</option>
                  <option value="20000-50000">₹20,000 - ₹50,000</option>
                  <option value="50000+">₹50,000+</option>
                </select>
              </div>
            </div>

            {/* Room Category Field - Enhanced with Room Type options */}
            <div className="col-md-6">
              <label htmlFor="roomCategory" className="form-label">Room Category</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-door-closed"></i></span>
                <select
                  className="form-select"
                  id="roomCategory"
                  name="roomCategory"
                  value={formFilters.roomCategory}
                  onChange={handleChange}
                >
                  <option value="">Any Category</option>
                  {/* Room Type Options */}
                  <option value="Single">Single Room</option>
                  <option value="Double">Double Room</option>
                  <option value="Separate">Separate Room</option>
                  <option value="Shared">Shared Room</option>
                  {/* Furniture Options */}
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                  {/* PG Options */}
                  <option value="PgType">PG Type</option>
                  <option value="GirlsPg">Girls PG</option>
                  <option value="BoysPg">Boys PG</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="col-12 d-grid mt-2">
              <button type="submit" className="btn btn-success btn-lg fw-semibold">
                <i className="bi bi-search me-2"></i>Find Now
              </button>
            </div>
          </form>
          
          {/* Near Me Section - Moved Outside Form */}
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
              <div className="text-center text-sm-start">
                <h6 className="mb-1 text-dark">Quick Location Access</h6>
                <small className="text-muted">Find properties near your current location</small>
              </div>
              <button 
                type="button" 
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={handleNearMe}
                title={!token ? "Login required to use location services" : "Find properties near you"}
              >
                <i className="bi bi-crosshair"></i>
                Near Me
              </button>
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="room-stats-section py-4">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-6 col-md-4 mb-3 mb-md-0">
              <h2 className="text-dark fw-bold mb-1">{SITE_STATISTICS.ACTIVE_LISTINGS}</h2>
              <div className="text-muted">{SITE_STATISTICS.LABELS.ACTIVE_LISTINGS}</div>
            </div>
            <div className="col-6 col-md-4 mb-3 mb-md-0">
              <h2 className="text-dark fw-bold mb-1">{SITE_STATISTICS.EXPERT_AGENTS}</h2>
              <div className="text-muted">{SITE_STATISTICS.LABELS.EXPERT_AGENTS}</div>
            </div>
            <div className="col-12 col-md-4">
              <h2 className="text-dark fw-bold mb-1">{SITE_STATISTICS.SUCCESS_RATE}</h2>
              <div className="text-muted">{SITE_STATISTICS.LABELS.SUCCESS_RATE}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default RoomSearchForm;
