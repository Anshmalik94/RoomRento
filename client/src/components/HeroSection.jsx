import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HeroSection.css'; // custom styles

function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/images/assest/image3.jpg',
    '/images/assest/image4.jpg'
  ];

  // Auto change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section className="hero-section-minimal">
      {/* Background Images */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`hero-background ${index === currentImageIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${image})`
          }}
        />
      ))}
      
      {/* Overlay */}
      <div className="hero-overlay" />
      
    </section>
  );
}

export default HeroSection;
