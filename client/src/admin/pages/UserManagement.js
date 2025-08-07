import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Dropdown, Modal } from 'react-bootstrap';
import { adminApiService } from '../services/adminApiService';
import '../styles/AdminMobile.css';

const UserManagement = ({ globalSearchQuery, onSearchQueryChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  useEffect(() => {
    loadUsers();
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await adminApiService.getUsers();
      console.log('Users API Response:', response);
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApiService.deleteUser(userId);
        await loadUsers(); // Reload users after deletion
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminApiService.updateUserStatus(userId, newStatus);
      await loadUsers(); // Reload users after status change
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      };
      
      await adminApiService.updateUser(editingUser._id, updateData);
      
      // Update password separately if provided
      if (editForm.password) {
        await adminApiService.updateUserPassword(editingUser._id, editForm.password);
      }
      
      setShowEditModal(false);
      setEditingUser(null);
      setEditForm({ name: '', email: '', password: '', role: '' });
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status) => {
    return (
      <Badge bg={status === 'active' ? 'success' : 'secondary'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
    <Container fluid className="user-management">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">User Management</h2>
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
              placeholder="Search users by name or email..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="primary" onClick={loadUsers}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Users ({filteredUsers.length} total)
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>#{user._id?.slice(-6)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2">
                            <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{getStatusBadge(user.status || 'active')}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="fas fa-ellipsis-v"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => handleEditUser(user)}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Edit User
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleToggleUserStatus(user._id, user.status || 'active')}
                            >
                              <i className={`fas fa-${user.status === 'active' ? 'ban' : 'check'} me-2`}></i>
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <i className="fas fa-trash me-2"></i>
                              Delete User
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No users found
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
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Enter new password or leave blank"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
