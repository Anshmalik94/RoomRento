import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">
          {/* Brand */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold text-danger">RoomRento</h5>
            <p className="text-muted">
              Find verified rooms for rent in your city with ease and security.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white text-decoration-none">Home</Link></li>
              <li><Link to="/rooms" className="text-white text-decoration-none">Rooms</Link></li>
              <li><Link to="/add-room" className="text-white text-decoration-none">Add Room</Link></li>
              <li><Link to="/login" className="text-white text-decoration-none">Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted mb-1"><i className="bi bi-envelope-fill me-2"></i> support@roomrento.com</p>
            <p className="text-muted"><i className="bi bi-telephone-fill me-2"></i> +91 9876543210</p>
          </div>
        </div>

        <div className="text-center border-top pt-3 mt-4 text-muted small">
          © {new Date().getFullYear()} RoomRento. All rights reserved
        </div>
      </div>
    </footer>
  );
}

export default Footer;
