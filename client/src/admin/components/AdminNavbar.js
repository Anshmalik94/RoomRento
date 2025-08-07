import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Dropdown, Form, InputGroup } from 'react-bootstrap';
import '../styles/AdminMobile.css';

const AdminNavbar = ({ toggleSidebar, user, onLogout, onSearch, searchValue }) => {
  const [searchQuery, setSearchQuery] = useState(searchValue || '');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  // Update local search query when prop changes
  useEffect(() => {
    setSearchQuery(searchValue || '');
  }, [searchValue]);

  return (
    <Navbar className="admin-navbar" expand="lg">
      <div className="d-flex align-items-center w-100">
        {/* Mobile/Desktop sidebar toggle */}
        <button
          className="btn btn-link d-lg-none me-3"
          onClick={toggleSidebar}
          style={{ border: 'none', color: '#6f42c1' }}
          aria-label="Toggle Sidebar"
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        {/* Desktop sidebar toggle */}
        <button
          className="btn btn-link d-none d-lg-block me-3"
          onClick={toggleSidebar}
          style={{ border: 'none', color: '#6f42c1' }}
          aria-label="Toggle Sidebar"
        >
          <i className="bi bi-layout-sidebar-inset fs-5"></i>
        </button>

        {/* Brand */}
        <Navbar.Brand className="admin-navbar-brand me-4 d-none d-sm-block">
          RoomRento Admin
        </Navbar.Brand>

        {/* Mobile Brand (shorter) */}
        <Navbar.Brand className="admin-navbar-brand me-4 d-sm-none">
          Admin
        </Navbar.Brand>

        {/* Search Box */}
        <div className="admin-search-box flex-grow-1 me-4 d-none d-md-block">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <InputGroup.Text className="admin-search-icon bg-light border-end-0">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search users, bookings, properties..."
                className="admin-search-input border-start-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Form>
        </div>

        {/* Mobile Search Button */}
        <button
          className="btn btn-outline-secondary d-md-none me-2"
          type="button"
          onClick={() => document.getElementById('mobileSearchCollapse')?.classList.toggle('show')}
          aria-label="Search"
        >
          <i className="bi bi-search"></i>
        </button>

        {/* Right side items */}
        <Nav className="ms-auto d-flex align-items-center">
          {/* Profile Dropdown */}
          <Dropdown className="admin-profile-dropdown">
            <Dropdown.Toggle 
              variant="link" 
              id="admin-profile-dropdown"
              className="admin-profile-dropdown-toggle d-flex align-items-center text-decoration-none"
            >
              <div className="me-2 d-none d-sm-block text-end">
                <div className="fw-semibold text-dark">Admin User</div>
                <small className="text-muted">Administrator</small>
              </div>
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="border-0 shadow">
              <Dropdown.Item href="#" className="d-flex align-items-center">
                <i className="bi bi-person me-2"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Item href="#" className="d-flex align-items-center">
                <i className="bi bi-gear me-2"></i>
                Settings
              </Dropdown.Item>
              <Dropdown.Item href="#" className="d-flex align-items-center">
                <i className="bi bi-question-circle me-2"></i>
                Help
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={handleLogout}
                className="d-flex align-items-center text-danger"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>

      {/* Mobile Search Collapse */}
      <div className="collapse d-md-none mt-2" id="mobileSearchCollapse">
        <Form onSubmit={handleSearch} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="me-2"
          />
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-search"></i>
          </button>
        </Form>
      </div>
    </Navbar>
  );
};

export default AdminNavbar;
