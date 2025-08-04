import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AboutSection.css';
import { STATS_ARRAY } from '../config/statistics';

function AboutSection() {
  const stats = STATS_ARRAY;

  return (
    <section className="about-section py-5">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Image */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="about-image-wrapper">
              <img
                src="/images/assets/Image1.jpg"
                alt="About RoomRento"
                className="about-main-image img-fluid"
                onError={(e) => {
                  e.target.src = "/images/banner.png";
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <div className="floating-card">
                <div className="floating-card-content">
                  <i className="bi bi-award text-white"></i>
                  <span className="text-white fw-bold">Trusted by 10K+ Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="col-lg-6">
            <div className="about-content">
              <h2 className="about-title fw-bold mb-4">
                About <span className="text-purple">RoomRento</span>
              </h2>
              <p className="about-description lead mb-4">
                RoomRento simplifies your search for affordable and comfortable living spaces. Whether you're looking for a room, shop, or hotel — we've got you covered.
              </p>
              <p className="about-description text-muted mb-4">
                Our platform connects seekers with verified listings across top cities, making your journey hassle-free, transparent, and trustworthy.
              </p>
              
              {/* Stats Grid */}
              <div className="row g-3 mt-4">
                {stats.map((stat, index) => (
                  <div className="col-6 col-md-3" key={index}>
                    <div className="stat-card text-center">
                      <div className="stat-number">{stat.number}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
