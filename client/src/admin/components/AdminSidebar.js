import React from 'react';
import { Nav } from 'react-bootstrap';
import '../styles/AdminMobile.css';

const AdminSidebar = ({ isCollapsed, isOpen, toggleSidebar, user, onLogout, currentPage, onPageChange }) => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    // Close mobile sidebar after selection
    if (window.innerWidth < 992) {
      toggleSidebar();
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { key: 'properties', icon: 'bi-building', label: 'Properties' },
    { key: 'users', icon: 'bi-people', label: 'Users' },
    { key: 'bookings', icon: 'bi-calendar-check', label: 'Bookings' },
    { key: 'analytics', icon: 'bi-graph-up', label: 'Analytics' },
    { key: 'settings', icon: 'bi-gear', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'show' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <h4 className="mb-0">
            {isCollapsed ? 'RR' : 'RoomRento'}
          </h4>
          {!isCollapsed && (
            <small className="text-light opacity-75">Admin Panel</small>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="px-3 py-2 border-bottom border-opacity-25">
            <div className="d-flex align-items-center">
              <div className="admin-user-avatar me-2">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-grow-1">
                <div className="fw-medium text-white small">{user.name}</div>
                <div className="text-light opacity-75" style={{ fontSize: '0.75rem' }}>
                  {user.role === 'admin' ? 'Administrator' : 'Property Owner'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Nav className="admin-sidebar-nav flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.key}
              className={`admin-sidebar-nav-link ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => handlePageChange(item.key)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Nav.Link>
          ))}

          {/* Logout */}
          <hr className="my-3 opacity-25" />
          <Nav.Link
            onClick={handleLogout}
            className="admin-sidebar-nav-link text-danger"
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </Nav.Link>
        </Nav>

        {/* Sidebar footer */}
        {!isCollapsed && (
          <div className="mt-auto p-3 text-center">
            <small className="text-light opacity-50">
              © 2025 RoomRento
            </small>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
