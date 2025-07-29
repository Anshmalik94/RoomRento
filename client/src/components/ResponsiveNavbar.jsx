import NotificationBell from './NotificationBell';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBed, 
  FaBuilding, 
  FaStore, 
  FaBell, 
  FaUser, 
  FaBars, 
  FaTimes,
  FaHeart,
  FaList,
  FaTachometerAlt,
  FaSignOutAlt,
  FaPlus
} from 'react-icons/fa';



const ResponsiveNavbar = ({ 
  token, 
  userInfo, 
  userRole, 
  handleLogout, 
  handleRentifyClick,
  handleLoginModalShow 
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  // NotificationBell handles notification state

  // Navigation functions
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  // Search function
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to rooms page with search query
      window.location.href = `/rooms?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile sidebar when clicking outside
      if (isMobileSidebarOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.hamburger-btn')) {
        closeMobileSidebar();
      }
      // Close user dropdown when clicking outside
      if (isUserDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeUserDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen, isUserDropdownOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
    closeUserDropdown();
  }, [location.pathname]);

  if (isLoginPage) return null;

  return (
    <>
      {/* Responsive Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid px-3">
          
          {/* Mobile Layout */}
          <div className="d-flex d-lg-none w-100 align-items-center position-relative">
            {/* Mobile Hamburger Menu (Left) */}
            <button 
              className="navbar-toggler border-0 me-3 hamburger-btn"
              onClick={toggleMobileSidebar}
              style={{ fontSize: '20px', color: '#6f42c1' }}
            >
              <FaBars />
            </button>

            {/* Mobile Search (Middle) */}
            <div className="flex-grow-1">
              <form onSubmit={handleSearch} className="d-flex">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Search rooms, hotels..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </form>
            </div>

            {/* Notification Bell (Right) */}
            {token && (
              <div className="ms-2 d-flex align-items-center">
                <NotificationBell bellIcon={<FaBell style={{ fontSize: '20px', color: '#6f42c1' }} />} />
              </div>
            )}
          </div>

          {/* Desktop Brand Logo (Left) */}
          <Link className="navbar-brand d-none d-lg-flex align-items-center" to="/">
            <img 
              src="/images/logo.png" 
              alt="RoomRento" 
              width="32" 
              height="32" 
              className="me-2" 
              style={{objectFit: 'contain'}}
              onError={(e) => {
                if (e.target.src.includes('logo.png')) {
                  e.target.src = "/logo56.png";
                } else {
                  e.target.style.display = 'none';
                  const textLogo = document.createElement('div');
                  textLogo.className = 'me-2 d-flex align-items-center justify-content-center';
                  textLogo.style.cssText = `
                    width: 32px; height: 32px; background-color: #6f42c1; 
                    border-radius: 8px; color: #fff; font-weight: 900; 
                    font-size: 16px; font-family: Arial Black, sans-serif;
                  `;
                  textLogo.textContent = 'R';
                  e.target.parentNode.insertBefore(textLogo, e.target);
                }
              }}
            />
            <span className="fw-bold" style={{ color: '#6f42c1', fontSize: '20px' }}>RoomRento</span>
          </Link>

          {/* Desktop Menu Items (Right) */}
          <div className="collapse navbar-collapse d-none d-lg-flex">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/">
                  <FaHome className="me-2" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/rooms">
                  <FaBed className="me-2" />
                  Rooms
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/hotels">
                  <FaBuilding className="me-2" />
                  Hotels
                </Link>
              </li>
              {/* Rentify Link for Owner role */}
              {token && userRole === "owner" && (
                <li className="nav-item">
                  <button 
                    className="nav-link btn border-0 bg-transparent d-flex align-items-center mx-2" 
                    onClick={handleRentifyClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <FaPlus className="me-2" />
                    Rentify
                  </button>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/shop">
                  <FaStore className="me-2" />
                  Shop
                </Link>
              </li>
            </ul>

            {/* Desktop Right Side Menu */}
            <ul className="navbar-nav">
              {/* Notifications Dropdown (bell icon stays the same) */}
              {token && (
                <li className="nav-item d-flex align-items-center">
                  <NotificationBell bellIcon={<FaBell style={{ fontSize: '18px', color: '#6f42c1' }} />} />
                </li>
              )}

              {/* User Profile Dropdown */}
              {token ? (
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <button
                    className="nav-link btn border-0 bg-transparent d-flex align-items-center"
                    onClick={toggleUserDropdown}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#6f42c1',
                        color: 'white'
                      }}
                    >
                      <FaUser />
                    </div>
                    <span>{userInfo.name || 'User'}</span>
                  </button>
                  
                  <ul className={`dropdown-menu dropdown-menu-end ${isUserDropdownOpen ? 'show' : ''}`}>
                    {userRole === "owner" ? (
                      <>
                        <li><h6 className="dropdown-header">Owner Panel</h6></li>
                        <li>
                          <Link className="dropdown-item" to="/profile" onClick={closeUserDropdown}>
                            <FaUser className="me-2" />
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/my-listings" onClick={closeUserDropdown}>
                            <FaList className="me-2" />
                            My Listings
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/owner-dashboard" onClick={closeUserDropdown}>
                            <FaTachometerAlt className="me-2" />
                            Dashboard
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={() => { handleLogout(); closeUserDropdown(); }}>
                            <FaSignOutAlt className="me-2" />
                            Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li><h6 className="dropdown-header">User Panel</h6></li>
                        <li>
                          <Link className="dropdown-item" to="/profile" onClick={closeUserDropdown}>
                            <FaUser className="me-2" />
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/saved-rooms" onClick={closeUserDropdown}>
                            <FaHeart className="me-2" />
                            Saved Rooms
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={() => { handleLogout(); closeUserDropdown(); }}>
                            <FaSignOutAlt className="me-2" />
                            Logout
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleLoginModalShow}
                    style={{ border: 'none' }}
                  >
                    <FaUser className="me-2" />
                    Login
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <>
        {/* Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="position-fixed w-100 h-100"
            style={{
              top: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
            onClick={closeMobileSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          className={`mobile-sidebar position-fixed h-100 bg-white shadow-lg ${isMobileSidebarOpen ? 'open' : ''}`}
          style={{
            top: 0,
            left: isMobileSidebarOpen ? '0' : '-300px',
            width: '280px',
            zIndex: 1050,
            transition: 'left 0.3s ease',
            overflowY: 'auto'
          }}
        >
          {/* Sidebar Header */}
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <div className="d-flex align-items-center">
              <img 
                src="/images/logo.png" 
                alt="RoomRento" 
                width="28" 
                height="28" 
                className="me-2" 
                style={{objectFit: 'contain'}}
                onError={(e) => {
                  if (e.target.src.includes('logo.png')) {
                    e.target.src = "/logo56.png";
                  } else {
                    e.target.style.display = 'none';
                    const textLogo = document.createElement('div');
                    textLogo.className = 'me-2 d-flex align-items-center justify-content-center';
                    textLogo.style.cssText = `
                      width: 28px; height: 28px; background-color: #6f42c1; 
                      border-radius: 6px; color: #fff; font-weight: 900; 
                      font-size: 14px; font-family: Arial Black, sans-serif;
                    `;
                    textLogo.textContent = 'R';
                    e.target.parentNode.insertBefore(textLogo, e.target);
                  }
                }}
              />
              <h5 className="mb-0 fw-bold" style={{ color: '#6f42c1' }}>RoomRento</h5>
            </div>
            <button 
              className="btn btn-link p-0"
              onClick={closeMobileSidebar}
              style={{ fontSize: '20px', color: '#6f42c1' }}
            >
              <FaTimes />
            </button>
          </div>

          {/* User Info Section */}
          {token && (
            <div className="p-3 border-bottom bg-light">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#6f42c1',
                    color: 'white'
                  }}
                >
                  <FaUser style={{ fontSize: '20px' }} />
                </div>
                <div>
                  <h6 className="mb-0">{userInfo.name || 'User'}</h6>
                  <small className="text-muted">{userInfo.email}</small>
                  <div>
                    <span className={`badge ${userRole === 'owner' ? 'bg-success' : 'bg-primary'}`}>
                      {userRole === 'owner' ? 'Property Owner' : 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="p-3">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link 
                  className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                  to="/"
                  onClick={closeMobileSidebar}
                >
                  <FaHome className="me-3" style={{ color: '#6f42c1' }} />
                  <span>Home</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                  to="/rooms"
                  onClick={closeMobileSidebar}
                >
                  <FaBed className="me-3" style={{ color: '#6f42c1' }} />
                  <span>Rooms</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                  to="/hotels"
                  onClick={closeMobileSidebar}
                >
                  <FaBuilding className="me-3" style={{ color: '#6f42c1' }} />
                  <span>Hotels</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                  to="/shop"
                  onClick={closeMobileSidebar}
                >
                  <FaStore className="me-3" style={{ color: '#6f42c1' }} />
                  <span>Shop</span>
                </Link>
              </li>
              
              {token && (
                <li className="mb-2 d-flex align-items-center">
                  <NotificationBell bellIcon={<FaBell className="me-3" style={{ color: '#6f42c1' }} />} />
                </li>
              )}
            </ul>

            {/* Role-based Menu */}
            {token && (
              <>
                <hr className="my-3" />
                <h6 className="text-muted text-uppercase small mb-3">
                  {userRole === 'owner' ? 'Owner Panel' : 'User Panel'}
                </h6>
                <ul className="list-unstyled mb-0">
                  {userRole === "owner" ? (
                    <>
                      <li className="mb-2">
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                          to="/my-listings"
                          onClick={closeMobileSidebar}
                        >
                          <FaList className="me-3" style={{ color: '#28a745' }} />
                          <span>My Listings</span>
                        </Link>
                      </li>
                      <li className="mb-2">
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                          to="/owner-dashboard"
                          onClick={closeMobileSidebar}
                        >
                          <FaTachometerAlt className="me-3" style={{ color: '#28a745' }} />
                          <span>Dashboard</span>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="mb-2">
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                          to="/saved-rooms"
                          onClick={closeMobileSidebar}
                        >
                          <FaHeart className="me-3" style={{ color: '#dc3545' }} />
                          <span>Saved Rooms</span>
                        </Link>
                      </li>
                      <li className="mb-2">
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-2 rounded nav-link-mobile"
                          to="/profile"
                          onClick={closeMobileSidebar}
                        >
                          <FaUser className="me-3" style={{ color: '#6f42c1' }} />
                          <span>Profile</span>
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li className="mt-3">
                    <button 
                      className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                      onClick={() => { handleLogout(); closeMobileSidebar(); }}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </>
            )}

            {/* Login for Non-authenticated Users */}
            {!token && (
              <>
                <hr className="my-3" />
                <button 
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  onClick={() => { handleLoginModalShow(); closeMobileSidebar(); }}
                  style={{ border: 'none' }}
                >
                  <FaUser className="me-2" />
                  Login / Register
                </button>
              </>
            )}
          </div>
        </div>
      </>

      {/* Additional CSS */}
      <style>{`
        .nav-link-mobile:hover {
          background-color: #f8f9fa;
          color: #6f42c1 !important;
        }
        
        .navbar-toggler:focus {
          box-shadow: none;
        }
        
        .dropdown-menu.show {
          display: block;
        }
        
        .mobile-sidebar {
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default ResponsiveNavbar;
