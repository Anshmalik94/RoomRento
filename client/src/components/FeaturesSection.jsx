import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FeaturesSection.css'; // optional custom styles

function FeaturesSection() {
  const features = [
    {
      title: "Verified Rooms",
      desc: "All listings are verified and regularly updated for your safety.",
      icon: "bi bi-shield-check"
    },
    {
      title: "Affordable Pricing",
      desc: "Rooms at budget-friendly rates with flexible terms.",
      icon: "bi bi-cash-coin"
    },
    {
      title: "24/7 Support",
      desc: "Our team is available around the clock to help you.",
      icon: "bi bi-headset"
    },
  ];

  return (
    <section className="py-5 bg-white features-section">
      <div className="container text-center">
        <h2 className="mb-4 fw-bold">Why Choose <span className="text-primary">RoomRento</span>?</h2>
        <p className="text-muted mb-5">We make room finding simple, secure and stress-free.</p>
        <div className="row">
          {features.map((feature, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card h-100 shadow-sm border-0 p-4">
                <div className="mb-3">
                  <i className={`${feature.icon} fs-1 text-danger`}></i>
                </div>
                <h5 className="fw-semibold mb-2">{feature.title}</h5>
                <p className="text-muted">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
