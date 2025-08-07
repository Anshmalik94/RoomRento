import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Dropdown, Modal } from 'react-bootstrap';
import { adminApiService } from '../services/adminApiService';
import '../styles/AdminMobile.css';

const BookingManagement = ({ globalSearchQuery, onSearchQueryChange }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    checkIn: '',
    checkOut: '',
    totalAmount: '',
    status: ''
  });

  useEffect(() => {
    loadBookings();
  }, []);

  // Sync with global search
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchTerm(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Update global search when local search changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('Loading bookings...');
      const response = await adminApiService.getBookings();
      console.log('Bookings API Response:', response);
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      try {
        await adminApiService.updateBookingStatus(bookingId, newStatus);
        await loadBookings(); // Reload bookings after status change
      } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status. Please try again.');
      }
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '',
      checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '',
      totalAmount: booking.totalAmount || '',
      status: booking.status || 'pending'
    });
    setShowEditModal(true);
  };

  const handleSaveBooking = async () => {
    try {
      await adminApiService.updateBooking(editingBooking._id, editForm);
      setShowEditModal(false);
      setEditingBooking(null);
      setEditForm({ checkIn: '', checkOut: '', totalAmount: '', status: '' });
      await loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await adminApiService.deleteBooking(bookingId);
        await loadBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      approved: 'info',
      declined: 'secondary',
      cancelled: 'danger',
      completed: 'primary'
    };

    return (
      <Badge bg={statusColors[status] || 'secondary'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.renter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.renter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

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
    <Container fluid className="booking-management">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Booking Management</h2>
        </Col>
      </Row>

      {/* Search and Filter Controls */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search bookings by user, room, or booking ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="primary" onClick={loadBookings}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Bookings Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Bookings ({filteredBookings.length} total)
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Renter</th>
                  <th>Property</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>#{booking._id?.slice(-6)}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{booking.renter?.name || 'N/A'}</div>
                          <small className="text-muted">{booking.renter?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>{booking.room?.title || 'N/A'}</td>
                      <td>{formatDate(booking.checkInDate)}</td>
                      <td>{formatDate(booking.checkOutDate)}</td>
                      <td>{formatCurrency(booking.totalAmount)}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="fas fa-ellipsis-v"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => handleEditBooking(booking)}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Edit Booking
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            {booking.status === 'pending' && (
                              <>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                  className="text-success"
                                >
                                  <i className="fas fa-check me-2"></i>
                                  Confirm
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                  className="text-danger"
                                >
                                  <i className="fas fa-times me-2"></i>
                                  Cancel
                                </Dropdown.Item>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Dropdown.Item 
                                onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                                className="text-info"
                              >
                                <i className="fas fa-check-double me-2"></i>
                                Mark Complete
                              </Dropdown.Item>
                            )}
                            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                              <Dropdown.Item 
                                onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                className="text-danger"
                              >
                                <i className="fas fa-ban me-2"></i>
                                Cancel Booking
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="text-danger"
                            >
                              <i className="fas fa-trash me-2"></i>
                              Delete Booking
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Booking Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-in Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-out Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBooking}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingManagement;
