import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';
import BASE_URL from '../config';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchUserProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading your profile..." />;
  }

  const role = localStorage.getItem('role');

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-circle me-3" style={{fontSize: '2.5rem'}}></i>
                <div>
                  <h4 className="mb-0">User Profile</h4>
                  <small>
                    {role === 'owner' ? 'Property Owner Account' : 'Renter Account'}
                  </small>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {!editing ? (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted d-block">Full Name</strong>
                        <h5 className="mb-0">{user?.name || 'Not provided'}</h5>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted d-block">Email Address</strong>
                        <h5 className="mb-0">{user?.email || 'Not provided'}</h5>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted d-block">Phone Number</strong>
                        <h5 className="mb-0">{user?.phone || 'Not provided'}</h5>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-muted d-block">Account Type</strong>
                        <span className={`badge ${role === 'owner' ? 'bg-success' : 'bg-info'} fs-6`}>
                          {role === 'owner' ? 'Property Owner' : 'Renter'}
                        </span>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <div className="mb-3">
                        <strong className="text-muted d-block">Address</strong>
                        <h5 className="mb-0">{user?.address || 'Not provided'}</h5>
                      </div>
                    </Col>
                  </Row>

                  {role === 'owner' && (
                    <Row className="mb-4">
                      <Col>
                        <Card className="bg-light">
                          <Card.Body>
                            <h6 className="text-primary">Owner Benefits</h6>
                            <ul className="mb-0">
                              <li>List unlimited properties</li>
                              <li>Manage bookings and inquiries</li>
                              <li>Access to analytics dashboard</li>
                              <li>Priority customer support</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      <i className="bi bi-pencil me-2"></i>Edit Profile
                    </Button>
                    {role === 'owner' && (
                      <Button variant="outline-primary" href="/owner-dashboard">
                        <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Form onSubmit={handleUpdateProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Account Type</Form.Label>
                        <Form.Control
                          type="text"
                          value={role === 'owner' ? 'Property Owner' : 'Renter'}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete address"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="success">
                      <i className="bi bi-check-lg me-2"></i>Save Changes
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      <i className="bi bi-x-lg me-2"></i>Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
