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
    <section className="hero-section bg-light py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
            <h1 className="display-5 fw-bold mb-3 text-dark">
              Find Your Perfect <span className="text-primary">Room</span>
            </h1>
            <p className="lead text-muted">
              Explore a wide range of rental rooms across the city — from budget to luxury.
            </p>
            <button
              onClick={scrollToSearch}
              className="btn btn-primary btn-lg mt-3"
            >
              Explore Now
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
