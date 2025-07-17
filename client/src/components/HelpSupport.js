import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './HelpSupport.css';

const HelpSupport = () => {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Hi, I need help with RoomRento.`);
    const whatsappUrl = `https://wa.me/918929082629?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="help-support-page">
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold text-gradient mb-3">
              <i className="bi bi-question-circle me-3"></i>
              Help & Support
            </h1>
            <p className="lead text-muted">
              Welcome to RoomRento Support! We're here to help you with any questions or issues.
            </p>
          </Col>
        </Row>

        {/* Main Support Card */}
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm bg-light">
              <Card.Body className="text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-headset display-1 text-purple"></i>
                </div>
                <h2 className="mb-3">Need Personal Assistance?</h2>
                <p className="text-muted mb-4 lead">
                  Our friendly support team is available to help you with any questions about room rentals, 
                  bookings, property listings, or technical issues.
                </p>
                
                <div className="mb-4">
                  <h5 className="mb-3">We can help you with:</h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Room booking issues</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Property listing help</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Account & login problems</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Payment & billing queries</span>
                      </div>
                    </Col>
                  </Row>
                </div>
                
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <Button 
                    variant="purple" 
                    size="lg"
                    onClick={handleWhatsAppContact}
                    className="px-4"
                  >
                    <i className="bi bi-whatsapp me-2"></i>
                    Chat on WhatsApp
                  </Button>
                  <Button 
                    variant="outline-purple" 
                    size="lg"
                    href="mailto:support@roomrento.com"
                    className="px-4"
                  >
                    <i className="bi bi-envelope me-2"></i>
                    Email Support
                  </Button>
                </div>
                
                <div className="mt-4">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Response time: Usually within 2-4 hours
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mt-5">
          <Col>
            <h4 className="text-center mb-4">Quick Actions</h4>
            <Row className="g-3">
              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <i className="bi bi-house-door display-4 text-purple mb-3"></i>
                    <h6>Browse Rooms</h6>
                    <p className="small text-muted">Find your perfect room</p>
                    <Button variant="outline-purple" size="sm" href="/rooms">
                      Explore
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <i className="bi bi-plus-circle display-4 text-purple mb-3"></i>
                    <h6>List Property</h6>
                    <p className="small text-muted">Add your room/hotel</p>
                    <Button variant="outline-purple" size="sm" href="/add-room">
                      Add Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <i className="bi bi-person-circle display-4 text-purple mb-3"></i>
                    <h6>Your Account</h6>
                    <p className="small text-muted">Manage your profile</p>
                    <Button variant="outline-purple" size="sm" href="/profile">
                      Profile
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <i className="bi bi-calendar-check display-4 text-purple mb-3"></i>
                    <h6>Your Bookings</h6>
                    <p className="small text-muted">View your reservations</p>
                    <Button variant="outline-purple" size="sm" href="/my-bookings">
                      View
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HelpSupport;
