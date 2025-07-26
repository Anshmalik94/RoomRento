import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HeroSection.css'; // custom styles

function HeroSection() {
  const scrollToExplore = () => {
    const section = document.getElementById("explore-newly-listed");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="hero-section py-5"
      // Gradient and border-radius now handled in CSS
    >
      <div className="container">
        <div className="row align-items-center min-vh-75">
          <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
            <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInLeft">
              Find your perfect <span style={{ color: '#FFD700' }}>Room</span>, <span style={{ color: '#FFD700' }}>Shop</span>, or <span style={{ color: '#FFD700' }}>Hotel</span>
            </h1>
            <p className="lead mb-4 animate__animated animate__fadeInLeft animate__delay-1s">
              With RoomRento — No broker, No commission, No hidden charges. Talk directly to the owner.
            </p>
            <p className="text-muted small">
              Discover a wide range of properties tailored to your needs. Whether you're looking for a cozy room, a spacious shop, or a luxurious hotel, RoomRento has got you covered. Start your journey today and connect directly with property owners.
            </p>
            <button
              onClick={scrollToExplore}
              className="btn btn-primary btn-lg btn-pill animate__animated animate__fadeInUp animate__delay-2s"
            >
              <i className="bi bi-search me-2"></i>Start Exploring
            </button>
          </div>
          <div className="col-md-6 text-center animate__animated animate__fadeInRight">
            <img
              src="/images/banner.png"
              alt="Find Room, Shop, or Hotel with RoomRento"
              className="img-fluid hero-img"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
