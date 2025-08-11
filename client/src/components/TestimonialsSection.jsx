import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TestimonialsSection.css';

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ravi Sharma',
      review:
        'RoomRento made my room hunting experience so smooth! I found a verified room within 2 days.',
    },
    {
      name: 'Priya Mehta',
      review:
        'The platform is super easy to use. I loved the direct contact feature with the owner.',
    },
    {
      name: 'Aman Verma',
      review:
        'Highly recommended! I was able to book my room and contact the landlord instantly.',
    },
    {
      name: 'Sneha Gupta',
      review:
        'Amazing service! The room verification process gave me complete confidence before booking.',
    },
    {
      name: 'Rohit Kumar',
      review:
        'Found my perfect PG within a week. The filter options made it so easy to find what I needed.',
    },
    {
      name: 'Neha Singh',
      review:
        'Excellent platform for room hunting. The owner contact feature saved me so much time.',
    },
    {
      name: 'Vikash Yadav',
      review:
        'Best room rental platform I have used. Quick response from owners and verified listings.',
    },
  ];

  // Create desktop slides (3 cards per slide) and mobile slides (1 card per slide)
  const desktopSlides = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    desktopSlides.push(testimonials.slice(i, i + 3));
  }

  return (
    <section className="testimonials-section py-5 bg-white">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">What Our Users Say</h2>
        
        {/* Desktop Carousel - Hidden on mobile */}
        <div 
          id="testimonialsCarouselDesktop" 
          className="carousel slide d-none d-md-block" 
          data-bs-ride="carousel"
          data-bs-touch="true"
          data-bs-interval="5000"
        >
          {/* Desktop Carousel Items */}
          <div className="carousel-inner">
            {desktopSlides.map((slideTestimonials, slideIndex) => (
              <div 
                key={slideIndex}
                className={`carousel-item ${slideIndex === 0 ? 'active' : ''}`}
              >
                <div className="row g-4 justify-content-center">
                  {slideTestimonials.map((t, index) => (
                    <div className="col-xl-4 col-lg-4 col-md-6" key={index}>
                      <div className="card h-100 shadow-sm border-0 testimonial-card mx-auto">
                        <div className="card-body p-4 text-center">
                          <div className="user-icon-wrapper mb-3 mx-auto">
                            <i className="bi bi-person-fill testimonial-user-icon"></i>
                          </div>
                          <h5 className="mb-2 fw-bold text-dark">{t.name}</h5>
                          <div className="mb-3">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                          </div>
                          <p className="text-muted fst-italic mb-0">"{t.review}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Controls */}
          <button 
            className="carousel-control-prev testimonial-nav-btn" 
            type="button" 
            data-bs-target="#testimonialsCarouselDesktop" 
            data-bs-slide="prev">
            <span className="carousel-control-prev-icon testimonial-nav-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button 
            className="carousel-control-next testimonial-nav-btn" 
            type="button" 
            data-bs-target="#testimonialsCarouselDesktop" 
            data-bs-slide="next">
            <span className="carousel-control-next-icon testimonial-nav-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>

        {/* Mobile Carousel - Hidden on desktop */}
        <div 
          id="testimonialsCarouselMobile" 
          className="carousel slide d-md-none" 
          data-bs-ride="carousel"
          data-bs-touch="true"
          data-bs-interval="5000"
        >
          {/* Mobile Carousel Items */}
          <div className="carousel-inner">
            {testimonials.map((t, index) => (
              <div 
                className={`carousel-item ${index === 0 ? 'active' : ''}`} 
                key={index}
              >
                <div className="row g-3 justify-content-center">
                  <div className="col-11 col-sm-9">
                    <div className="card h-100 shadow-sm border-0 testimonial-card mx-auto">
                      <div className="card-body p-4 text-center">
                        <div className="user-icon-wrapper mb-3 mx-auto">
                          <i className="bi bi-person-fill testimonial-user-icon"></i>
                        </div>
                        <h5 className="mb-2 fw-bold text-dark">{t.name}</h5>
                        <div className="mb-3">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <i className="bi bi-star-fill text-warning"></i>
                        </div>
                        <p className="text-muted fst-italic mb-0">"{t.review}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Controls */}
          <button 
            className="carousel-control-prev testimonial-nav-btn" 
            type="button" 
            data-bs-target="#testimonialsCarouselMobile" 
            data-bs-slide="prev">
            <span className="carousel-control-prev-icon testimonial-nav-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button 
            className="carousel-control-next testimonial-nav-btn" 
            type="button" 
            data-bs-target="#testimonialsCarouselMobile" 
            data-bs-slide="next">
            <span className="carousel-control-next-icon testimonial-nav-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
