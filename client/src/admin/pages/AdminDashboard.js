import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { adminApiService } from '../services/adminApiService';
import '../styles/AdminMobile.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      const [statsResponse, bookingsResponse, usersResponse] = await Promise.all([
        adminApiService.getDashboardStats(),
        adminApiService.getRecentBookings(),
        adminApiService.getRecentUsers()
      ]);
      
      console.log('Stats Response:', statsResponse);
      console.log('Bookings Response:', bookingsResponse);
      console.log('Users Response:', usersResponse);
      
      setStats(statsResponse.data || {});
      setRecentBookings(bookingsResponse.data || []);
      setRecentUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data instead of crashing
      setStats({ totalUsers: 0, totalProperties: 0, totalBookings: 0, totalRevenue: 0 });
      setRecentBookings([]);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info'
    };
    return (
      <Badge bg={statusColors[status] || 'secondary'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Dashboard Overview</h2>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                  <p className="mb-0">Total Users</p>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{stats.totalProperties}</h3>
                  <p className="mb-0">Total Properties</p>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-building fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{stats.totalBookings}</h3>
                  <p className="mb-0">Total Bookings</p>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-calendar-check fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{formatCurrency(stats.totalRevenue)}</h3>
                  <p className="mb-0">Total Revenue</p>
                </div>
                <div className="stats-icon">
                  <i className="fas fa-rupee-sign fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Data Tables */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Bookings</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Property</th>
                      <th>Check-in</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>#{booking._id?.slice(-6)}</td>
                          <td>{booking.user?.name || 'N/A'}</td>
                          <td>{booking.room?.name || booking.hotel?.name || 'N/A'}</td>
                          <td>{formatDate(booking.checkInDate)}</td>
                          <td>{formatCurrency(booking.totalAmount)}</td>
                          <td>{getStatusBadge(booking.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No recent bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Users</h5>
            </Card.Header>
            <Card.Body>
              {recentUsers.length > 0 ? (
                <div className="recent-users-list">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="recent-user-item d-flex align-items-center mb-3">
                      <div className="user-avatar me-3">
                        <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="user-info flex-grow-1">
                        <h6 className="mb-0">{user.name}</h6>
                        <small className="text-muted">{user.email}</small>
                        <br />
                        <small className="text-muted">Joined: {formatDate(user.createdAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  No recent users found
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
