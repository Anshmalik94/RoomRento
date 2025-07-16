import React, { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './HelpSupport.css';

function HelpSupport() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Automatically redirect to WhatsApp after 3 seconds
    const timer = setTimeout(() => {
      const phoneNumber = '8929082629';
      const message = 'Hi RoomRento Team, I need help with...';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Navigate back to home page after opening WhatsApp
      navigate('/');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    }; // Cleanup timers on component unmount
  }, [navigate]);

  const handleWhatsAppChat = () => {
    const phoneNumber = '8929082629';
    const message = 'Hi RoomRento Team, I need help with...';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    navigate('/');
  };

  return (
    <Container className="help-support-container py-5">
      <div className="d-flex justify-content-center">
        <Card className="help-support-card shadow-sm">
          <Card.Body className="text-center p-5">
            <h2 className="help-support-heading mb-4">
              Welcome to RoomRento Support 👋
            </h2>
            
            <div className="help-support-content mb-4">
              <p className="help-support-text mb-3">
                Hi there! We're thrilled to have you as part of the RoomRento family.
              </p>
              <p className="help-support-text mb-3">
                Whether you're looking for the perfect room, need help with bookings, or have any questions about our platform, we're here to assist you every step of the way.
              </p>
              <p className="help-support-text mb-3">
                Our friendly support team is always ready to provide you with quick and helpful solutions.
              </p>
              <p className="help-support-text mb-3">
                Don't hesitate to reach out – we're just a message away and would love to help make your experience amazing!
              </p>
              <p className="help-support-text mb-4">
                Let's get you the support you deserve. 💜
              </p>
              
              {countdown > 0 && (
                <p className="countdown-text mb-3">
                  Opening WhatsApp in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
            <Button 
              variant="success" 
              size="lg" 
              className="rounded-pill px-4 py-3 fw-bold"
              onClick={handleWhatsAppChat}
            >
              <i className="bi bi-whatsapp me-2"></i>
              Chat Now on WhatsApp
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default HelpSupport;
