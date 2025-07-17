import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Button, Alert, Form } from 'react-bootstrap';
import './HelpSupport.css';

const HelpSupport = () => {
  const [activeKey, setActiveKey] = useState('0');
  const [showContact, setShowContact] = useState(false);

  const faqData = [
    {
      id: '0',
      question: 'How do I list my room on RoomRento?',
      answer: 'To list your room, simply click on the "Add Room" button in the navigation bar. Fill out the required details like title, description, price, location, and upload photos. Your listing will be live once submitted.'
    },
    {
      id: '1',
      question: 'How does the booking process work?',
      answer: 'Once you find a room you like, click on "Request Booking" on the room details page. The owner will receive your request and can approve or decline it. You\'ll get a notification once they respond.'
    },
    {
      id: '2',
      question: 'How do I edit or delete my room listing?',
      answer: 'Go to "My Listings" from your profile menu. You can edit room details, update photos, or delete listings from there. Changes are reflected immediately.'
    },
    {
      id: '3',
      question: 'What payment methods are accepted?',
      answer: 'Currently, payments are handled directly between tenants and room owners. We recommend secure payment methods and proper documentation for all transactions.'
    },
    {
      id: '4',
      question: 'How do I contact room owners?',
      answer: 'Room owners\' contact information is displayed on the room details page. You can call them directly or use the booking request feature to initiate contact.'
    },
    {
      id: '5',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. Your personal information is encrypted and protected. We never share your data with third parties without your consent.'
    },
    {
      id: '6',
      question: 'How do I report inappropriate content?',
      answer: 'If you encounter any inappropriate listings or behavior, please contact us immediately through WhatsApp or use the contact form below. We take all reports seriously.'
    },
    {
      id: '7',
      question: 'Can I modify my booking request?',
      answer: 'Yes, you can view and manage your booking requests in the "My Bookings" section. You can cancel pending requests if needed.'
    }
  ];

  const handleWhatsAppContact = () => {
    const phoneNumber = '918929082629';
    const message = 'Hello! I need help with RoomRento platform.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="help-support-page">
      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold text-gradient mb-3">Help & Support</h1>
            <p className="lead text-muted">
              Get help with your RoomRento experience. Find answers to common questions or contact our support team.
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mx-auto">
            {/* FAQ Section */}
            <Card className="shadow-lg border-0 mb-5">
              <Card.Header className="bg-gradient-purple text-white">
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-question-circle me-2"></i>
                  Frequently Asked Questions
                </h3>
              </Card.Header>
              <Card.Body className="p-0">
                <Accordion activeKey={activeKey} onSelect={setActiveKey}>
                  {faqData.map((faq) => (
                    <Accordion.Item key={faq.id} eventKey={faq.id}>
                      <Accordion.Header>
                        <strong>{faq.question}</strong>
                      </Accordion.Header>
                      <Accordion.Body className="text-muted">
                        {faq.answer}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>

            {/* Contact Support Section */}
            <Card className="shadow-lg border-0 mb-5">
              <Card.Header className="bg-gradient-purple text-white">
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-headset me-2"></i>
                  Contact Support
                </h3>
              </Card.Header>
              <Card.Body className="text-center py-5">
                <Row>
                  <Col md={6} className="mb-4 mb-md-0">
                    <div className="support-option">
                      <i className="bi bi-whatsapp display-1 text-success mb-3"></i>
                      <h4 className="fw-bold">WhatsApp Support</h4>
                      <p className="text-muted mb-3">
                        Get instant help via WhatsApp. Our team is available to assist you.
                      </p>
                      <Button 
                        variant="success" 
                        size="lg" 
                        onClick={handleWhatsAppContact}
                        className="rounded-pill px-4"
                      >
                        <i className="bi bi-whatsapp me-2"></i>
                        Chat on WhatsApp
                      </Button>
                      <div className="mt-2 text-muted small">
                        +91 8929082629
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="support-option">
                      <i className="bi bi-envelope display-1 text-purple mb-3"></i>
                      <h4 className="fw-bold">Email Support</h4>
                      <p className="text-muted mb-3">
                        Send us your questions and we'll get back to you within 24 hours.
                      </p>
                      <Button 
                        variant="outline-purple" 
                        size="lg"
                        onClick={() => setShowContact(!showContact)}
                        className="rounded-pill px-4"
                      >
                        <i className="bi bi-envelope me-2"></i>
                        Send Message
                      </Button>
                    </div>
                  </Col>
                </Row>

                {showContact && (
                  <Row className="mt-5">
                    <Col lg={8} className="mx-auto">
                      <Alert variant="info" className="border-0">
                        <i className="bi bi-info-circle me-2"></i>
                        For faster response, please use WhatsApp support above.
                      </Alert>
                      <Card className="border-0 shadow-sm">
                        <Card.Body>
                          <Form>
                            <Row>
                              <Col md={6} className="mb-3">
                                <Form.Group>
                                  <Form.Label>Your Name</Form.Label>
                                  <Form.Control type="text" placeholder="Enter your name" />
                                </Form.Group>
                              </Col>
                              <Col md={6} className="mb-3">
                                <Form.Group>
                                  <Form.Label>Email Address</Form.Label>
                                  <Form.Control type="email" placeholder="Enter your email" />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Form.Group className="mb-3">
                              <Form.Label>Subject</Form.Label>
                              <Form.Control type="text" placeholder="Brief description of your issue" />
                            </Form.Group>
                            <Form.Group className="mb-4">
                              <Form.Label>Message</Form.Label>
                              <Form.Control 
                                as="textarea" 
                                rows={4} 
                                placeholder="Describe your issue in detail..."
                              />
                            </Form.Group>
                            <Button variant="purple" size="lg" className="w-100 rounded-pill">
                              <i className="bi bi-send me-2"></i>
                              Send Message
                            </Button>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Quick Tips */}
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-gradient-purple text-white">
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-lightbulb me-2"></i>
                  Quick Tips
                </h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="tip-item">
                      <i className="bi bi-camera text-purple me-2"></i>
                      <strong>Upload Quality Photos:</strong> Add clear, well-lit photos to attract more bookings.
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="tip-item">
                      <i className="bi bi-geo-alt text-purple me-2"></i>
                      <strong>Accurate Location:</strong> Provide precise location details for better visibility.
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="tip-item">
                      <i className="bi bi-chat-dots text-purple me-2"></i>
                      <strong>Respond Quickly:</strong> Fast responses to booking requests improve your reputation.
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="tip-item">
                      <i className="bi bi-shield-check text-purple me-2"></i>
                      <strong>Verify Details:</strong> Always verify tenant information before confirming bookings.
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HelpSupport;
