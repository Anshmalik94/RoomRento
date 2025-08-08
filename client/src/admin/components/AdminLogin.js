import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';
import { loginUser } from '../../services/apiService';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: 'admin@roomrento.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting admin login with:', formData);

    try {
      const data = await loginUser(formData);
      console.log('Admin login response:', data);
      console.log('User role from response:', data.role);
      console.log('User object from response:', data.user);

      // Check both data.role and data.user.role for compatibility
      const userRole = data.role || data.user?.role;
      console.log('Final role check:', userRole);

      if (userRole === 'admin' || userRole === 'owner') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        navigate('/admin/dashboard');
      } else {
        console.log('Role check failed. User role:', userRole);
        setError('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Enhanced error handling for admin login
      if (error.type === 'NETWORK_ERROR') {
        setError('Network connection error. Please check your internet connection and try again.');
      } else if (error.type === 'SERVER_ERROR') {
        setError('Server is temporarily unavailable. Please wait a moment and try again.');
      } else if (error.type === 'AUTH_ERROR') {
        setError(error.message || 'Invalid admin credentials. Please check your email and password.');
      } else {
        setError('Login failed. Please try again or contact support if the issue persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <h2>RoomRento Admin</h2>
          <p>Secure Admin Panel Access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter admin email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing In...
              </>
            ) : (
              'Sign In to Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <small className="text-muted">
            Demo Credentials:<br />
            Email: admin@roomrento.com<br />
            Password: admin123
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
