import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AboutSection.css';

function AboutSection() {
  return (
    <section className="about-section py-5 bg-light">
      <div className="container">
        <div className="row align-items-center">
          {/* Image */}
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src="https://img.freepik.com/free-vector/real-estate-agent-showing-house-property-client_74855-14069.jpg"
              alt="About RoomRento"
              className="img-fluid rounded shadow"
            />
          </div>

          {/* Text Content */}
          <div className="col-md-6 text-center text-md-start">
            <h2 className="fw-bold mb-3">About <span className="text-primary">RoomRento</span></h2>
            <p className="text-muted mb-3">
              RoomRento is a platform built to simplify your house hunting experience. Whether you're a student, working professional, or family — we help you find verified rental rooms fast and hassle-free.
            </p>
            <p className="text-muted mb-3">
              With features like direct booking, owner contact, and map-based search, finding your next room is now easier than ever.
            </p>
            <a href="/contact" className="btn mt-2" style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
