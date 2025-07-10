import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TestimonialsSection.css';

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ravi Sharma',
      review:
        'RoomRento made my room hunting experience so smooth! I found a verified room within 2 days.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Priya Mehta',
      review:
        'The platform is super easy to use. I loved the direct contact feature with the owner.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Aman Verma',
      review:
        'Highly recommended! I was able to book my room and contact the landlord instantly.',
      image: 'https://randomuser.me/api/portraits/men/51.jpg',
    },
  ];

  return (
    <section className="testimonials-section py-5 bg-white">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">What Our Users Say</h2>
        <div className="row">
          {testimonials.map((t, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card h-100 shadow-sm border-0 p-4 testimonial-card">
                <img
                  src={t.image}
                  alt={t.name}
                  className="rounded-circle mb-3 mx-auto testimonial-img"
                  width="80"
                  height="80"
                />
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
