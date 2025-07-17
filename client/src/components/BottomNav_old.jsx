import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './BottomNav.css';

function BottomNav() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <nav 
      className="bottom-navbar navbar bg-light border-top d-lg-none" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999
      }}
    >
      <div className="container-fluid">
        <div className="navbar-nav nav-justified w-100 flex-row">
          {/* Home - Always visible */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-item nav-link text-center ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-house fs-5 d-block"></i>
            <small>Home</small>
          </NavLink>

          {/* Search/Rooms - Always visible */}
          <NavLink 
            to="/rooms" 
            className={({ isActive }) => 
              `nav-item nav-link text-center ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-search fs-5 d-block"></i>
            <small>Search</small>
          </NavLink>

          {/* Rentify - Only for logged in owners */}
          {token && localStorage.getItem("role") === "owner" ? (
            <button 
              className="nav-item nav-link text-center border-0 bg-transparent"
              onClick={() => {
                // Trigger the same modal functionality
                const event = new CustomEvent('openRentifyModal');
                window.dispatchEvent(event);
              }}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-plus-circle fs-5 d-block"></i>
              <small>Rentify</small>
            </button>
          ) : (
            <NavLink 
              to="/hotels" 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-building fs-5 d-block"></i>
              <small>Hotels</small>
            </NavLink>
          )}

          {/* Saved/My Items - Dynamic based on role */}
          {token ? (
            <NavLink 
              to={role === 'owner' ? '/my-listings' : '/my-bookings'} 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-heart fs-5 d-block"></i>
              <small>{role === 'owner' ? 'Listings' : 'Saved'}</small>
            </NavLink>
          ) : (
            <NavLink 
              to="/shop" 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-shop fs-5 d-block"></i>
              <small>Shop</small>
            </NavLink>
          )}

          {/* Profile/Login - Dynamic based on auth state */}
          {token ? (
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-person fs-5 d-block"></i>
              <small>Profile</small>
            </NavLink>
          ) : (
            <NavLink 
              to="/login" 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-person-plus fs-5 d-block"></i>
              <small>Login</small>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
