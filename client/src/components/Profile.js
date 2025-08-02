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
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#000000',
      backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(33,37,41,0.9) 100%)',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            {message && (
              <Alert 
                variant={message.includes('successfully') ? 'success' : 'danger'}
                className="mb-4"
                style={{
                  backgroundColor: message.includes('successfully') ? 'rgba(25, 135, 84, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                  borderColor: message.includes('successfully') ? 'rgba(25, 135, 84, 0.3)' : 'rgba(220, 53, 69, 0.3)',
                  color: '#ffffff',
                  border: '1px solid'
                }}
              >
                {message}
              </Alert>
            )}

            <Card 
              className="shadow-lg border-0"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '15px'
              }}
            >
              <Card.Header 
                style={{
                  background: 'linear-gradient(135deg, #6f42c1, #8e44ad)',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px 15px 0 0'
                }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-4"
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '24px'
                    }}
                  >
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h3 className="mb-1" style={{ color: '#ffffff', fontWeight: '600' }}>User Profile</h3>
                    <span 
                      className={`badge ${role === 'owner' ? 'bg-success' : 'bg-info'}`}
                      style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                    >
                      {role === 'owner' ? 'Property Owner Account' : 'Renter Account'}
                    </span>
                  </div>
                </div>
              </Card.Header>

              <Card.Body style={{ padding: '2rem', backgroundColor: 'transparent' }}>
                {!editing ? (
                  <>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="mb-4">
                          <strong className="d-block mb-2" style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</strong>
                          <h5 className="mb-0" style={{ color: '#ffffff', fontWeight: '500' }}>{user?.name || 'Not provided'}</h5>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-4">
                          <strong className="d-block mb-2" style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</strong>
                          <h5 className="mb-0" style={{ color: '#ffffff', fontWeight: '500' }}>{user?.email || 'Not provided'}</h5>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="mb-4">
                          <strong className="d-block mb-2" style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone Number</strong>
                          <h5 className="mb-0" style={{ color: '#ffffff', fontWeight: '500' }}>{user?.phone || 'Not provided'}</h5>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-4">
                          <strong className="d-block mb-2" style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Type</strong>
                          <span className={`badge ${role === 'owner' ? 'bg-success' : 'bg-info'} fs-6`} style={{ padding: '8px 16px' }}>
                            {role === 'owner' ? 'Property Owner' : 'Renter'}
                          </span>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col>
                        <div className="mb-4">
                          <strong className="d-block mb-2" style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</strong>
                          <h5 className="mb-0" style={{ color: '#ffffff', fontWeight: '500' }}>{user?.address || 'Not provided'}</h5>
                        </div>
                      </Col>
                    </Row>

                    {role === 'owner' && (
                      <Row className="mb-4">
                        <Col>
                          <Card 
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px'
                            }}
                          >
                            <Card.Body style={{ padding: '1.5rem' }}>
                              <h6 style={{ color: '#ffffff', marginBottom: '1rem', fontWeight: '600' }}>
                                <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
                                Owner Benefits
                              </h6>
                              <ul className="mb-0" style={{ color: '#ffffff', opacity: 0.8 }}>
                                <li className="mb-2">List unlimited properties</li>
                                <li className="mb-2">Manage bookings and inquiries</li>
                                <li className="mb-2">Access to analytics dashboard</li>
                                <li>Priority customer support</li>
                              </ul>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    )}

                    <div className="d-flex gap-3 flex-wrap">
                      <Button 
                        onClick={() => setEditing(true)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                      >
                        <i className="bi bi-pencil me-2"></i>Edit Profile
                      </Button>
                      {role === 'owner' && (
                        <Button 
                          href="/owner-dashboard"
                          style={{
                            backgroundColor: 'rgba(25, 135, 84, 0.2)',
                            border: '1px solid rgba(25, 135, 84, 0.3)',
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.3)';
                            e.target.style.borderColor = 'rgba(25, 135, 84, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.2)';
                            e.target.style.borderColor = 'rgba(25, 135, 84, 0.3)';
                          }}
                        >
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
                          <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Account Type</Form.Label>
                          <Form.Control
                            type="text"
                            value={role === 'owner' ? 'Property Owner' : 'Renter'}
                            disabled
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '12px',
                              opacity: 0.7
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your complete address"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      />
                    </Form.Group>

                    <div className="d-flex gap-3 flex-wrap">
                      <Button 
                        type="submit"
                        style={{
                          backgroundColor: 'rgba(25, 135, 84, 0.2)',
                          border: '1px solid rgba(25, 135, 84, 0.3)',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.3)';
                          e.target.style.borderColor = 'rgba(25, 135, 84, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.2)';
                          e.target.style.borderColor = 'rgba(25, 135, 84, 0.3)';
                        }}
                      >
                        <i className="bi bi-check-lg me-2"></i>Save Changes
                      </Button>
                      <Button 
                        onClick={() => setEditing(false)}
                        style={{
                          backgroundColor: 'rgba(108, 117, 125, 0.2)',
                          border: '1px solid rgba(108, 117, 125, 0.3)',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(108, 117, 125, 0.3)';
                          e.target.style.borderColor = 'rgba(108, 117, 125, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(108, 117, 125, 0.2)';
                          e.target.style.borderColor = 'rgba(108, 117, 125, 0.3)';
                        }}
                      >
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
    </div>
  );
};

export default Profile;
