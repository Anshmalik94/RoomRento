import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer
      className="footer pt-5 pb-3"
      style={{
        background: 'linear-gradient(to right, #ffffff, #6f42c1)',
        color: '#fff',
        marginTop: '0',
      }}
    >
      <div className="container">
        <div className="row g-4">
          {/* Brand/Logo Section */}
          <div className="col-md-3 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img
                src="/logo56.png"
                alt="RoomRento Logo"
                width="40"
                height="40"
                className="me-2"
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = "/images/logo.png";
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <h5 className="fw-bold mb-0 text-dark">RoomRento</h5>
            </div>
            <div className="d-flex gap-2">
              <a
                href="https://facebook.com/roomrento"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: '#6f42c1',
                  color: '#fff',
                  width: '35px',
                  height: '35px',
                }}
              >
                <i className="bi bi-facebook"></i>
              </a>

              <a
                href="https://instagram.com/roomrento"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: '#6f42c1',
                  color: '#fff',
                  width: '35px',
                  height: '35px',
                }}
              >
                <i className="bi bi-instagram"></i>
              </a>

              <a
                href="https://wa.me/918929082629"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: '#6f42c1',
                  color: '#fff',
                  width: '35px',
                  height: '35px',
                }}
              >
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Quick Section */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-dark">Quick</h6>
            <ul className="list-unstyled text-dark">
              <li><a href="/career.html" className="text-decoration-none text-dark">Career</a></li>
              <li><Link to="/help" className="text-decoration-none text-dark">Help & Support</Link></li>
              <li><a href="/partner.html" className="text-decoration-none text-dark">Become a Partner</a></li>
            </ul>
          </div>

          {/* Policy Section */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-dark">Policy</h6>
            <ul className="list-unstyled text-dark">
              <li><a href="/privacy-policy.html" className="text-decoration-none text-dark">Privacy Policy</a></li>
              <li><a href="/disclaimer.html" className="text-decoration-none text-dark">Disclaimer</a></li>
              <li><a href="/terms.html" className="text-decoration-none text-dark">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-dark">Contact</h6>
            <p className="mb-1 text-dark">Noida Sector - 5</p>
            <p className="mb-1 text-dark">WhatsApp: 8929082629</p>
            <p className="mb-0 text-dark">roomrento00@gmail.com</p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-top pt-3 mt-3">
          <p className="text-center text-dark mb-0 small">
            © {new Date().getFullYear()} RoomRento. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
