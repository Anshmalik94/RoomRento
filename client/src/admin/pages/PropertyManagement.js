import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Pagination, InputGroup, Dropdown } from 'react-bootstrap';
import { adminApiService } from '../services/adminApiService';
import '../styles/AdminMobile.css';

const PropertyManagement = ({ globalSearchQuery, onSearchQueryChange }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getProperties({
          page: currentPage,
          limit: 10,
          search: searchTerm,
          type: typeFilter
        });
        
        setProperties(response.data.properties || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentPage, searchTerm, typeFilter]);

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

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getProperties({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        type: typeFilter
      });
      
      setProperties(response.data.properties || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || property.name || '',
      description: property.description || '',
      price: property.price || property.rent || '',
      status: property.status || 'active',
      location: property.location || '',
      type: property.type || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminApiService.updateProperty(editingProperty._id, formData);
      setShowEditModal(false);
      setEditingProperty(null);
      loadProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property');
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await adminApiService.updatePropertyStatus(propertyId, newStatus);
      loadProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
      alert('Failed to update property status');
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await adminApiService.deleteProperty(propertyId);
        loadProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning',
      blocked: 'danger'
    };
    return (
      <Badge bg={statusColors[status] || 'secondary'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      room: 'primary',
      hotel: 'info',
      shop: 'warning'
    };
    return (
      <Badge bg={typeColors[type] || 'secondary'}>
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
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
    <Container fluid className="property-management">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Property Management</h2>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={loadProperties}>
              <i className="fas fa-search"></i>
            </Button>
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="rooms">Rooms</option>
            <option value="hotels">Hotels</option>
            <option value="shops">Shops</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="primary" onClick={loadProperties}>
            <i className="fas fa-refresh me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Properties Table */}
      <Card>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Price</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.length > 0 ? properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {property.images && property.images.length > 0 && (
                        <img
                          src={property.images[0]}
                          alt={property.title || property.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                          className="rounded"
                        />
                      )}
                      <div>
                        <strong>{property.title || property.name}</strong>
                        {property.description && (
                          <div className="text-muted small">
                            {property.description.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getTypeBadge(property.type)}</td>
                  <td>
                    {property.userId ? (
                      <div>
                        <div>{property.userId.name}</div>
                        <small className="text-muted">{property.userId.email}</small>
                      </div>
                    ) : (
                      <span className="text-muted">No Owner</span>
                    )}
                  </td>
                  <td>{formatCurrency(property.price || property.rent || 0)}</td>
                  <td>{property.location || property.address || 'N/A'}</td>
                  <td>{getStatusBadge(property.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(property)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          Status
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleStatusChange(property._id, 'active')}>
                            Active
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleStatusChange(property._id, 'inactive')}>
                            Inactive
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleStatusChange(property._id, 'blocked')}>
                            Blocked
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(property._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No properties found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {renderPagination()}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title/Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price/Rent</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
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
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PropertyManagement;
