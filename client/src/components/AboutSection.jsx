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
              src="/images/about1.jpg"
              alt="About RoomRento"
              className="img-fluid zigzag-border"
            />
          </div>

          {/* Text Content */}
          <div className="col-md-6 text-center text-md-start">
            <h2 className="fw-bold mb-3">About <span className="text-primary">RoomRento</span></h2>
            <p className="text-muted mb-3">
              RoomRento simplifies your search for affordable and comfortable living spaces. Whether you're looking for a room, shop, or hotel — we've got you covered. Our platform connects seekers with verified listings across top cities, making your journey hassle-free, transparent, and trustworthy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
