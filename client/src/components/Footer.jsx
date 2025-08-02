import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-professional">
      <div className="container">
        
        {/* Main Footer Content */}
        <div className="row g-4 pb-4">
          
          {/* Brand Section */}
          <div className="col-12 col-lg-4 mb-4">
            <div className="footer-brand">
              <div className="d-flex align-items-center mb-3">
                <img
                  src="/logo56.png"
                  alt="RoomRento Logo"
                  width="45"
                  height="45"
                  className="me-3 footer-logo"
                  onError={(e) => {
                    e.target.src = "/images/logo.png";
                    e.target.onerror = () => {
                      e.target.style.display = 'none';
                    };
                  }}
                />
                <h4 className="footer-brand-title mb-0">RoomRento</h4>
              </div>
              
              <p className="footer-description mb-4">
                Your trusted partner for finding perfect accommodations. 
                We connect you with verified properties across multiple cities 
                with transparent pricing and genuine reviews.
              </p>
              
              {/* Social Media Links */}
              <div className="footer-social">
                <h6 className="footer-section-title mb-3">Follow Us</h6>
                <div className="social-links">
                  <a
                    href="https://www.facebook.com/share/19cTQFRWtG/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link facebook"
                    aria-label="Facebook"
                  >
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a
                    href="https://www.instagram.com/room_rento?igsh=MWxtajF1MzhsN2Yzcg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                    aria-label="Instagram"
                  >
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a
                    href="https://youtube.com/@roomrento?si=-GKiVzXkLrqm4cnT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link youtube"
                    aria-label="YouTube"
                  >
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a
                    href="https://wa.me/918929082629"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link whatsapp"
                    aria-label="WhatsApp"
                  >
                    <i className="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-4 col-lg-2 mb-4">
            <div className="footer-section">
              <h6 className="footer-section-title mb-3">Quick</h6>
              <ul className="footer-links">
                <li><a href="/career.html" className="footer-link">Career</a></li>
                <li><Link to="/help" className="footer-link">Help & Support</Link></li>
                <li><a href="/partner.html" className="footer-link">Become a Partner</a></li>
              </ul>
            </div>
          </div>
          
          {/* Policy */}
          <div className="col-4 col-lg-2 mb-4">
            <div className="footer-section">
              <h6 className="footer-section-title mb-3">Policy</h6>
              <ul className="footer-links">
                <li><a href="/privacy-policy.html" className="footer-link">Privacy Policy</a></li>
                <li><a href="/disclaimer.html" className="footer-link">Disclaimer</a></li>
                <li><a href="/terms.html" className="footer-link">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="col-4 col-lg-2 mb-4">
            <div className="footer-section">
              <h6 className="footer-section-title mb-3">Contact</h6>
              <div className="footer-contact">
                <div className="contact-item mb-3">
                  <i className="bi bi-geo-alt contact-icon"></i>
                  <div className="contact-details">
                    <span className="contact-label">Office</span>
                    <span className="contact-value">Noida Sector - 5</span>
                  </div>
                </div>
                
                <div className="contact-item mb-3">
                  <i className="bi bi-whatsapp contact-icon"></i>
                  <div className="contact-details">
                    <span className="contact-label">WhatsApp</span>
                    <a href="https://wa.me/918929082629" className="contact-value footer-link">
                      8929082629
                    </a>
                  </div>
                </div>
                
                <div className="contact-item mb-3">
                  <i className="bi bi-envelope contact-icon"></i>
                  <div className="contact-details">
                    <span className="contact-label">Email</span>
                    <a href="mailto:roomrento121ERROR in ./src/components/RoomSearchForm.css (./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[0].oneOf[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[0].oneOf[5].use[2]!./src/components/RoomSearchForm.css)
Module build failed (from ./node_modules/postcss-loader/dist/cjs.js):
SyntaxError

(25:1) C:\Users\DELL\Desktop\RoomRento\client\src\components\RoomSearchForm.css Unclosed block

  23 | }
  24 | 
> 25 | .room-search-form-card {
     | ^
  26 |   border-radius: 24px;
  27 |   background: rgba(255, 255, 255, 0.95) !important;@gmail.com" className="contact-value footer-link">
                      roomrento121@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom - Simple Copyright */}
        <div className="border-top pt-3 mt-3">
          <p className="text-center mb-0 small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © {currentYear} RoomRento. All rights reserved.
          </p>
        </div>
        
      </div>
      
      {/* Background Pattern */}
      <div className="footer-pattern"></div>
      
    </footer>
  );
}

export default Footer;
