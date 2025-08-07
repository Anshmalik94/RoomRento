import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import BookingManagement from './pages/BookingManagement';
import PropertyManagement from './pages/PropertyManagement';
import AdminAnalytics from './pages/AdminAnalyticsFixed';
import AdminSettings from './pages/AdminSettings';
import './styles/AdminPanel.css';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSearchHandlers, setPageSearchHandlers] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin' || parsedUser.role === 'owner') {
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Trigger search on the current page if it has a search handler
    if (pageSearchHandlers[currentPage]) {
      pageSearchHandlers[currentPage](query);
    }
  };

  const registerPageSearchHandler = (page, handler) => {
    setPageSearchHandlers(prev => ({
      ...prev,
      [page]: handler
    }));
  };

  const renderCurrentPage = () => {
    const pageProps = { 
      globalSearchQuery: searchQuery,
      onSearchQueryChange: setSearchQuery 
    };
    
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard {...pageProps} />;
      case 'users':
        return <UserManagement {...pageProps} />;
      case 'bookings':
        return <BookingManagement {...pageProps} />;
      case 'properties':
        return <PropertyManagement {...pageProps} />;
      case 'analytics':
        return <AdminAnalytics {...pageProps} />;
      case 'settings':
        return <AdminSettings {...pageProps} />;
      default:
        return <AdminDashboard {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-app">
      <AdminLayout 
        user={user} 
        onLogout={handleLogout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSearch={handleSearch}
        searchValue={searchQuery}
      >
        {renderCurrentPage()}
      </AdminLayout>
    </div>
  );
};

export default AdminApp;
