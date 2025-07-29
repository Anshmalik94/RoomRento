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
        <div className="row g-4">
          {testimonials.map((t, index) => (
            <div className="col-lg-4 col-md-6 mb-4" key={index}>
              <div className="card h-100 shadow-sm border-0 p-4 testimonial-card">
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
    </section>
  );
}

export default TestimonialsSection;
