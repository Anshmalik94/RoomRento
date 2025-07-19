import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function BottomNav({ handleRentifyClick }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return null;

  return (
    <div 
      className="bottom-nav-responsive d-lg-none"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #dee2e6',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <NavLink 
        to="/" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: isActive ? '#007bff' : '#6c757d',
          fontSize: '0.75rem',
          fontWeight: isActive ? '600' : 'normal',
          transition: 'all 0.2s ease'
        })}
      >
        <i className="bi bi-house" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
        <span>Home</span>
      </NavLink>

      <NavLink 
        to="/rooms" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: isActive ? '#007bff' : '#6c757d',
          fontSize: '0.75rem',
          fontWeight: isActive ? '600' : 'normal',
          transition: 'all 0.2s ease'
        })}
      >
        <i className="bi bi-door-open" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
        <span>Rooms</span>
      </NavLink>

      {role === "owner" && (
        <button 
          onClick={handleRentifyClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            background: 'transparent',
            color: '#6c757d',
            fontSize: '0.75rem',
            fontWeight: 'normal',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-plus-circle" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
          <span>Rentify</span>
        </button>
      )}

      {role !== "owner" && (
        <NavLink 
          to="/hotels" 
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: isActive ? '#007bff' : '#6c757d',
            fontSize: '0.75rem',
            fontWeight: isActive ? '600' : 'normal',
            transition: 'all 0.2s ease'
          })}
        >
          <i className="bi bi-building" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
          <span>Hotels</span>
        </NavLink>
      )}

      <NavLink 
        to="/notifications" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: isActive ? '#007bff' : '#6c757d',
          fontSize: '0.75rem',
          fontWeight: isActive ? '600' : 'normal',
          transition: 'all 0.2s ease',
          position: 'relative'
        })}
      >
        <i className="bi bi-bell" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
        <span>Notifications</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: isActive ? '#007bff' : '#6c757d',
          fontSize: '0.75rem',
          fontWeight: isActive ? '600' : 'normal',
          transition: 'all 0.2s ease'
        })}
      >
        <i className="bi bi-person" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
        <span>Profile</span>
      </NavLink>
    </div>
  );
}

export default BottomNav;
