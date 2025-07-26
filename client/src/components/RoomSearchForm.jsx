import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './RoomSearchForm.css';

function RoomSearchForm({ filters, onSubmit }) {
  const [formFilters, setFormFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem('roomFilters');
    return savedFilters ? JSON.parse(savedFilters) : filters;
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
    onSubmit(formFilters);
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/rooms?lat=${latitude}&lng=${longitude}&nearby=true`);
        },
        (error) => {
          alert('Location access denied or not available');
          console.error('Geolocation error:', error);
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
        className={`room-search-form-section d-flex justify-content-center align-items-center py-5 bg-transparent ${
          animate ? 'zoom-highlight' : ''
        }`}
      >
        <div
          className="room-search-form-card bg-white shadow rounded-4 p-4 w-100"
          style={{ maxWidth: 700 }}
        >
          <h3 className="fw-bold text-center mb-1">Start Your Room Search</h3>
          <p className="text-center text-muted mb-4">
            Discover thousands of verified room listings
          </p>
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            {/* Location Dropdown and Near Me Button */}
            <div className="col-md-6">
              <label htmlFor="location" className="form-label fw-semibold">Around Me</label>
              <div className="input-group custom-group">
                <select
                  className="form-select border-end-0"
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
                <button 
                  type="button" 
                  className="btn near-me-btn border-start-0"
                  onClick={handleNearMe}
                >
                  <i className="bi bi-crosshair me-1"></i>Near me
                </button>
              </div>
            </div>

            {/* Room Type Field */}
            <div className="col-md-6">
              <label htmlFor="roomType" className="form-label">Room Type</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-building"></i></span>
                <select
                  className="form-select"
                  id="roomType"
                  name="roomType"
                  value={formFilters.roomType}
                  onChange={handleChange}
                >
                  <option value="">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Shop">Shop</option>
                  <option value="Separate">Separate</option>
                  <option value="Shared">Shared</option>
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
                  <option value="5000">Up to ₹5,000</option>
                  <option value="10000">Up to ₹10,000</option>
                  <option value="20000">Up to ₹20,000</option>
                  <option value="50000">Up to ₹50,000</option>
                </select>
              </div>
            </div>

            {/* Room Category Field */}
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
                  <option value="">Any</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="room-stats-section py-4">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-6 col-md-4 mb-3 mb-md-0">
              <h2 className="text-dark fw-bold mb-1">1250+</h2>
              <div className="text-muted">Active Listings</div>
            </div>
            <div className="col-6 col-md-4 mb-3 mb-md-0">
              <h2 className="text-dark fw-bold mb-1">89+</h2>
              <div className="text-muted">Expert Agents</div>
            </div>
            <div className="col-12 col-md-4">
              <h2 className="text-dark fw-bold mb-1">96%</h2>
              <div className="text-muted">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default RoomSearchForm;
