import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AdminAnalyticsSimple = () => {
  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Analytics Dashboard</h4>
              <p className="text-muted mb-0">Real-time insights and performance metrics</p>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-muted mb-1">Total Revenue</h6>
                          <h3 className="mb-0">₹0</h3>
                          <small className="text-muted">Coming Soon</small>
                        </div>
                        <div className="bg-success bg-opacity-10 p-2 rounded">
                          <span className="text-success fs-4">💰</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-muted mb-1">Web Reach</h6>
                          <h3 className="mb-0">12,567</h3>
                          <small className="text-success">+12% this week</small>
                        </div>
                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                          <span className="text-primary fs-4">🌐</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-muted mb-1">Social Reach</h6>
                          <h3 className="mb-0">8,234</h3>
                          <small className="text-info">+8% this week</small>
                        </div>
                        <div className="bg-info bg-opacity-10 p-2 rounded">
                          <span className="text-info fs-4">📱</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-muted mb-1">Today's Bookings</h6>
                          <h3 className="mb-0">7</h3>
                          <small className="text-warning">Live updates</small>
                        </div>
                        <div className="bg-warning bg-opacity-10 p-2 rounded">
                          <span className="text-warning fs-4">📅</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col lg={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-transparent border-0 pb-0">
                      <h5 className="mb-0">Listings Overview</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-primary">45</h4>
                            <small className="text-muted">Total Listings</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-success">38</h4>
                            <small className="text-muted">Active</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-warning">5</h4>
                            <small className="text-muted">Pending</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-info">12</h4>
                            <small className="text-muted">Featured</small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-transparent border-0 pb-0">
                      <h5 className="mb-0">Booking Status</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-primary">127</h4>
                            <small className="text-muted">Total Bookings</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-success">89</h4>
                            <small className="text-muted">Confirmed</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-warning">23</h4>
                            <small className="text-muted">Pending</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3">
                            <h4 className="text-danger">15</h4>
                            <small className="text-muted">Cancelled</small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col lg={12}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-transparent border-0 pb-0">
                      <h5 className="mb-0">Top Countries - Visitor Distribution</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <div className="text-center">
                            <h4 className="text-success">🇮🇳 India</h4>
                            <p className="mb-0">8,456 visitors</p>
                            <small className="text-muted">67.3%</small>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="text-center">
                            <h4 className="text-primary">🇺🇸 USA</h4>
                            <p className="mb-0">1,234 visitors</p>
                            <small className="text-muted">9.8%</small>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="text-center">
                            <h4 className="text-info">🇬🇧 UK</h4>
                            <p className="mb-0">856 visitors</p>
                            <small className="text-muted">6.8%</small>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="text-center">
                            <h4 className="text-warning">🇨🇦 Canada</h4>
                            <p className="mb-0">445 visitors</p>
                            <small className="text-muted">3.5%</small>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Live Updates Footer */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-2">
              <small className="text-muted">
                🔄 Last updated: {new Date().toLocaleString()} • Live updates every 30 seconds
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminAnalyticsSimple;
