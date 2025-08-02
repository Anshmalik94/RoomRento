import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './BottomNav.css';

function BottomNav({ handleRentifyClick }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Show different navigation based on login status
  if (!token) {
    // Show help button for non-logged in users on mobile
    return (
      <>
        <div 
          className="mobile-help-nav d-lg-none"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
        >
          <NavLink 
            to="/help"
            style={{
              background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 20px',
              boxShadow: '0 4px 15px rgba(111, 66, 193, 0.3)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <i className="bi bi-headset"></i>
            Help & Support
          </NavLink>
        </div>
      </>
    );
  }

  return (
    <div className="bottom-nav-container d-lg-none">
      <div className="bottom-nav-items">
        {/* Left Side - 2 items */}
        <NavLink 
          to="/" 
          className="nav-item"
        >
          <i className="bi bi-house"></i>
          <span>Home</span>
        </NavLink>

        {role === "owner" ? (
          <NavLink 
            to="/my-listings" 
            className="nav-item"
          >
            <i className="bi bi-list-ul"></i>
            <span>Listings</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/help" 
            className="nav-item"
          >
            <i className="bi bi-headset"></i>
            <span>Help</span>
          </NavLink>
        )}

        {/* Center Elevated Button - Rentify for owners, Rooms for users */}
        {role === "owner" ? (
          <button 
            onClick={handleRentifyClick}
            className="center-button"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Rentify</span>
          </button>
        ) : (
          <NavLink 
            to="/rooms"
            className="center-button-link"
          >
            <i className="bi bi-door-open"></i>
            <span>Rooms</span>
          </NavLink>
        )}

        {/* Right Side - 2 items */}
        {role === "owner" ? (
          <NavLink 
            to="/help"
            className="nav-item"
          >
            <i className="bi bi-headset"></i>
            <span>Help & Support</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/bookings"
            className="nav-item"
          >
            <i className="bi bi-calendar-check"></i>
            <span>Bookings</span>
          </NavLink>
        )}

        <NavLink 
          to="/profile" 
          className="nav-item"
        >
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
}

export default BottomNav;
