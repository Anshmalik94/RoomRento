import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import '../styles/AdminPanel.css';
import '../styles/AdminMobile.css';

const AdminLayout = ({ user, onLogout, currentPage, onPageChange, children, onSearch, searchValue }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Always start closed
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close sidebar when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure sidebar is closed on mobile by default
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle body scroll lock when sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="admin-sidebar-overlay show" 
          onClick={handleOverlayClick}
        ></div>
      )}
      
      <div className="admin-content-wrapper">
        {/* Sidebar */}
        <AdminSidebar 
          isCollapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          user={user}
          onLogout={onLogout}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />

        {/* Main Content */}
        <div className={`admin-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Top Navbar */}
          <AdminNavbar 
            toggleSidebar={toggleSidebar} 
            user={user}
            onLogout={onLogout}
            onSearch={onSearch}
            searchValue={searchValue}
          />

          {/* Page Content */}
          <div className="admin-page-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
