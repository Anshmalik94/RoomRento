import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './BottomNav.css';

function BottomNav() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return null; // Don't show for guest users

  return (
    <nav className="navbar navbar-light bg-light border-top d-lg-none bottom-navbar">
      <div className="container-fluid">
        <div className="navbar-nav nav-justified w-100 flex-row">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-item nav-link text-center ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-house fs-5 d-block"></i>
            <small>Home</small>
          </NavLink>

          <NavLink 
            to="/rooms" 
            className={({ isActive }) => 
              `nav-item nav-link text-center ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-search fs-5 d-block"></i>
            <small>Search</small>
          </NavLink>

          {role === "owner" && (
            <NavLink 
              to="/owner-dashboard" 
              className={({ isActive }) => 
                `nav-item nav-link text-center ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-plus-circle fs-5 d-block"></i>
              <small>Rentify</small>
            </NavLink>
          )}

          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `nav-item nav-link text-center ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-person fs-5 d-block"></i>
            <small>Profile</small>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
