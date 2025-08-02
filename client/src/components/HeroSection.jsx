import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HeroSection.css';
import InstallPWAButton from './InstallPWAButton';
import { SITE_STATISTICS } from '../config/statistics';

function HeroSection() {
  const scrollToProperties = () => {
    const propertiesSection = document.getElementById('explore-newly-listed');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="hero-section-professional" id="hero">
      {/* Professional Overlay */}
      <div className="hero-overlay-modern" />
      
      {/* Content Container */}
      <div className="container h-100">
        <div className="row h-100 align-items-center justify-content-center">
          <div className="col-12 col-lg-8 text-center">
            <div className="hero-content animate__fadeInUp">
              
              {/* Main Heading */}
              <h1 className="hero-title mb-4">
                Find Your Perfect
                <span className="text-primary d-block">
                  Home Away From Home
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="hero-subtitle mb-5">
                Discover comfortable rooms, hotels, and shops with 
                <strong className="text-primary"> verified listings</strong> and 
                <strong className="text-primary"> trusted reviews</strong>
              </p>
              
              {/* CTA Buttons */}
              <div className="hero-cta-buttons">
                <button 
                  className="btn btn-primary btn-lg me-3 mb-3 mb-sm-0"
                  onClick={scrollToProperties}
                >
                  <i className="fas fa-search me-2"></i>
                  Explore Properties
                </button>
                
                <button className="btn btn-outline-light btn-lg mb-3 mb-sm-0">
                  <i className="fas fa-play me-2"></i>
                  Watch Demo
                </button>
              </div>

              {/* PWA Install Button */}
              <InstallPWAButton />
              
              {/* Trust Indicators */}
              <div className="hero-trust-indicators mt-5">
                <div className="row g-4 text-center">
                  <div className="col-4">
                    <div className="trust-stat">
                      <h3 className="text-white mb-1">{SITE_STATISTICS.TOTAL_PROPERTIES}</h3>
                      <small className="text-white-50">{SITE_STATISTICS.LABELS.PROPERTIES}</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="trust-stat">
                      <h3 className="text-white mb-1">{SITE_STATISTICS.HAPPY_CUSTOMERS}</h3>
                      <small className="text-white-50">{SITE_STATISTICS.LABELS.HAPPY_CUSTOMERS}</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="trust-stat">
                      <h3 className="text-white mb-1">{SITE_STATISTICS.CITIES_COVERED}</h3>
                      <small className="text-white-50">{SITE_STATISTICS.LABELS.CITIES}</small>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator">
          <button 
            className="btn btn-link text-white p-0"
            onClick={scrollToProperties}
            aria-label="Scroll to properties"
          >
            <i className="fas fa-chevron-down fa-2x animate-bounce"></i>
          </button>
        </div>
        
      </div>
      
      {/* Background Pattern Overlay */}
      <div className="hero-pattern-overlay"></div>
      
    </section>
  );
}

export default HeroSection;
