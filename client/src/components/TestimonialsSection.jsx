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

  return (
    <section className="testimonials-section py-5 bg-white">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">What Our Users Say</h2>
        
        {/* Bootstrap Carousel */}
        <div id="testimonialsCarousel" className="carousel slide" data-bs-ride="carousel">
          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            <button 
              type="button" 
              data-bs-target="#testimonialsCarousel" 
              data-bs-slide-to="0" 
              className="active" 
              aria-current="true" 
              aria-label="Slide 1">
            </button>
            <button 
              type="button" 
              data-bs-target="#testimonialsCarousel" 
              data-bs-slide-to="1" 
              aria-label="Slide 2">
            </button>
            <button 
              type="button" 
              data-bs-target="#testimonialsCarousel" 
              data-bs-slide-to="2" 
              aria-label="Slide 3">
            </button>
          </div>

          {/* Carousel Items */}
          <div className="carousel-inner">
            {/* Slide 1 - First 3 testimonials */}
            <div className="carousel-item active">
              <div className="row g-3 justify-content-center">
                {testimonials.slice(0, 3).map((t, index) => (
                  <div className="col-xl-4 col-lg-4 col-md-6 col-sm-10 col-12" key={index}>
                    <div className="card h-100 shadow-sm border-0 p-3 testimonial-card mx-auto">
                      <div className="user-icon-wrapper mb-3 mx-auto">
                        <i className="fas fa-user testimonial-user-icon"></i>
                      </div>
                      <h5 className="mb-1 text-center">{t.name}</h5>
                      <p className="text-muted fst-italic mt-2 text-center">"{t.review}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide 2 - Next 3 testimonials */}
            <div className="carousel-item">
              <div className="row g-3 justify-content-center">
                {testimonials.slice(3, 6).map((t, index) => (
                  <div className="col-xl-4 col-lg-4 col-md-6 col-sm-10 col-12" key={index + 3}>
                    <div className="card h-100 shadow-sm border-0 p-3 testimonial-card mx-auto">
                      <div className="user-icon-wrapper mb-3 mx-auto">
                        <i className="fas fa-user testimonial-user-icon"></i>
                      </div>
                      <h5 className="mb-1">{t.name}</h5>
                      <p className="text-muted fst-italic mt-2">"{t.review}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide 3 - Last testimonial */}
            <div className="carousel-item">
              <div className="row g-3 justify-content-center">
                {testimonials.slice(6, 7).map((t, index) => (
                  <div className="col-xl-4 col-lg-4 col-md-6 col-sm-10 col-12" key={index + 6}>
                    <div className="card h-100 shadow-sm border-0 p-3 testimonial-card mx-auto">
                      <div className="user-icon-wrapper mb-3 mx-auto">
                        <i className="fas fa-user testimonial-user-icon"></i>
                      </div>
                      <h5 className="mb-1 text-center">{t.name}</h5>
                      <p className="text-muted fst-italic mt-2 text-center">"{t.review}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <button 
            className="carousel-control-prev" 
            type="button" 
            data-bs-target="#testimonialsCarousel" 
            data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button 
            className="carousel-control-next" 
            type="button" 
            data-bs-target="#testimonialsCarousel" 
            data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
