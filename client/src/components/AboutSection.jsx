import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AboutSection.css';
import '../styles/responsive-framework.css';
import { STATS_ARRAY } from '../config/statistics';
import { IMAGE_PATHS } from '../config/imagePaths';

function AboutSection() {
  const stats = STATS_ARRAY;

  return (
    <section className="about-section py-4 py-md-5">
      <div className="container-fluid px-3 px-md-4">
        <div className="row align-items-center g-4 g-md-5">
          {/* Image */}
          <div className="col-12 col-lg-6 mb-3 mb-lg-0">
            <div className="about-image-wrapper">
              <img
                src={IMAGE_PATHS.ABOUT_IMAGE_1}
                alt="About RoomRento"
                className="about-main-image img-fluid w-100"
                style={{ 
                  borderRadius: '1rem',
                  objectFit: 'cover',
                  aspectRatio: '16/10'
                }}
                onError={(e) => {
                  e.target.src = IMAGE_PATHS.BANNER;
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                  };
                }}
              />
              <div className="floating-card d-none d-md-block">
                <div className="floating-card-content">
                  <i className="bi bi-award text-white"></i>
                  <span className="text-white fw-bold">Trusted by 10K+ Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="col-12 col-lg-6">
            <div className="about-content px-2 px-md-0">
              <h2 className="h2-responsive text-center text-lg-start mb-3 mb-md-4">
                About <span className="text-purple">RoomRento</span>
              </h2>
              <p className="text-responsive lead mb-3 mb-md-4 text-center text-lg-start">
                RoomRento simplifies your search for affordable and comfortable living spaces. Whether you're looking for a room, shop, or hotel — we've got you covered.
              </p>
              <p className="text-responsive text-muted mb-4 text-center text-lg-start">
                Our platform connects seekers with verified listings across top cities, making your journey hassle-free, transparent, and trustworthy.
              </p>
              
              {/* Mobile Trust Badge - Visible only on mobile */}
              <div className="d-block d-md-none text-center mb-4">
                <div className="badge bg-success px-3 py-2 fs-6">
                  <i className="bi bi-patch-check-fill me-2"></i>
                  Trusted by 10K+ Users
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="row g-2 g-md-3 mt-3 mt-md-4 justify-content-center">
                {stats.map((stat, index) => (
                  <div className="col-5 col-sm-4 col-md-3" key={index}>
                    <div className="stat-card text-center p-2 p-md-3 mx-auto">
                      <div className="stat-number fs-4 fs-md-3 fw-bold text-primary">{stat.number}</div>
                      <div className="stat-label fs-6 fs-md-5 text-muted">{stat.label}</div>
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
