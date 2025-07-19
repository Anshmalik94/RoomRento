import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return (
    <footer className="footer pt-5 pb-3" style={{background: '#000', color: '#fff'}}>
      <div className="container">
        <div className="row g-4">
          {/* Brand/Logo Section */}
          <div className="col-md-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img 
                src="/logo56.png" 
                alt="RoomRento Logo" 
                width="40" 
                height="40" 
                className="me-2"
                style={{objectFit: 'contain'}}
                onError={(e) => {
                  e.target.src = "/images/logo.png";
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <h5 className="fw-bold mb-0" style={{color: '#fff'}}>RoomRento</h5>
            </div>
            <p className="text-white-50 mb-3">
              Find verified rooms for rent in your city with ease and security. Your trusted partner in finding the perfect accommodation.
            </p>
            <div className="d-flex gap-2">
              <a href="https://facebook.com/roomrento" target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{background: '#6f42c1', color: '#fff', width: '35px', height: '35px'}}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://twitter.com/roomrento" target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{background: '#000', border: '1px solid #6f42c1', color: '#6f42c1', width: '35px', height: '35px'}}>
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://instagram.com/roomrento" target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{background: '#6f42c1', color: '#fff', width: '35px', height: '35px'}}>
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{color: '#fff'}}>Quick Links</h6>
            <div className="row">
              <div className="col-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                      <i className="bi bi-house me-2" style={{color: '#6f42c1'}}></i>Home
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/rooms" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                      <i className="bi bi-door-open me-2" style={{color: '#6f42c1'}}></i>Rooms
                    </Link>
                  </li>
                  {/* Show Rentify only for owners */}
                  {token && userRole === "owner" && (
                    <li className="mb-2">
                      <Link to="/add-property" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                        <i className="bi bi-plus-circle me-2" style={{color: '#6f42c1'}}></i>Rentify
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              <div className="col-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/hotels" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                      <i className="bi bi-building me-2" style={{color: '#6f42c1'}}></i>Hotels
                    </Link>
                  </li>
                  {/* Show appropriate booking links based on role */}
                  {token && (
                    <li className="mb-2">
                      {userRole === "owner" ? (
                        <Link to="/my-bookings" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                          <i className="bi bi-calendar-check me-2" style={{color: '#6f42c1'}}></i>My Bookings
                        </Link>
                      ) : (
                        <Link to="/my-booking-requests" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                          <i className="bi bi-calendar-event me-2" style={{color: '#6f42c1'}}></i>My Bookings
                        </Link>
                      )}
                    </li>
                  )}
                  <li className="mb-2">
                    <Link to="/help" className="text-decoration-none text-white-50 d-flex align-items-center" style={{transition: 'color 0.3s ease'}}>
                      <i className="bi bi-question-circle me-2" style={{color: '#6f42c1'}}></i>Help
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{color: '#fff'}}>Contact Us</h6>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-envelope-fill me-3" style={{color: '#6f42c1', fontSize: '1.2rem'}}></i>
                <div>
                  <p className="mb-0 text-white-50">Email Support</p>
                  <a href="mailto:support@roomrento.com" className="text-decoration-none" style={{color: '#fff'}}>
                    support@roomrento.com
                  </a>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-telephone-fill me-3" style={{color: '#6f42c1', fontSize: '1.2rem'}}></i>
                <div>
                  <p className="mb-0 text-white-50">Phone Support</p>
                  <a href="tel:+919876543210" className="text-decoration-none" style={{color: '#fff'}}>
                    +91 9876543210
                  </a>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-3" style={{color: '#6f42c1', fontSize: '1.2rem'}}></i>
                <div>
                  <p className="mb-0 text-white-50">Address</p>
                  <span style={{color: '#fff'}}>Delhi, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-top pt-4 mt-4" style={{borderColor: '#333 !important'}}>
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0 text-white-50 small">
                © {new Date().getFullYear()} RoomRento. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <a href="/privacy-policy" className="text-decoration-none text-white-50 small" style={{transition: 'color 0.3s ease'}}>
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="text-decoration-none text-white-50 small" style={{transition: 'color 0.3s ease'}}>
                  Terms of Service
                </a>
                <a href="/cookie-policy" className="text-decoration-none text-white-50 small" style={{transition: 'color 0.3s ease'}}>
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
