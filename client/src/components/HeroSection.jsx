import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HeroSection.css'; // custom styles

function HeroSection() {
  const scrollToSearch = () => {
    const section = document.getElementById("room-search-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-section py-5">
      <div className="container">
        <div className="row align-items-center min-vh-75">
          <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
            <h1 className="display-4 fw-bold mb-3 fade-in">
              Find Your Perfect <span style={{color: '#6f42c1'}}>Room</span>
            </h1>
            <p className="lead mb-4" style={{color: 'rgba(0, 0, 0, 0.8)'}}>
              Explore a wide range of rental rooms across the city — from budget to luxury.
            </p>
            <button
              onClick={scrollToSearch}
              className="btn btn-primary btn-lg btn-pill scale-hover"
            >
              <i className="bi bi-search me-2"></i>Explore Now
            </button>
          </div>
          <div className="col-md-6 text-center">
            <img
              src="https://img.freepik.com/free-vector/house-searching-concept-illustration_114360-4316.jpg"
              alt="Find Room"
              className="img-fluid hero-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
