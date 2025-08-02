import NotificationBellDisplay from './NotificationBellDisplay';
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
  
  // Navigation functions
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  // Search function
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.href = `/rooms?search=${encodeURIComponent(searchQuery.trim())}`;
      }, 100);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileSidebarOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.hamburger-btn')) {
        closeMobileSidebar();
      }
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
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container-fluid px-3">
          
          {/* Mobile Layout */}
          <div className="d-flex d-lg-none w-100 align-items-center position-relative">
            {/* Mobile Hamburger Menu (Left) */}
            <button 
              className="navbar-toggler border-0 me-3 hamburger-btn"
              onClick={toggleMobileSidebar}
              style={{ fontSize: '16px', color: '#ffffff' }}
            >
              <FaBars />
            </button>

            {/* Mobile Search (Right) */}
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
                <NotificationBellDisplay bellIcon={<FaBell style={{ fontSize: '16px', color: '#ffffff' }} />} />
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
                    width: 32px; height: 32px; background-color: #212529; 
                    border-radius: 8px; color: #fff; font-weight: 900; 
                    font-size: 16px; font-family: Arial Black, sans-serif;
                  `;
                  textLogo.textContent = 'R';
                  e.target.parentNode.insertBefore(textLogo, e.target);
                }
              }}
            />
            <span className="fw-bold" style={{ color: '#ffffff', fontSize: '18px' }}>RoomRento</span>
          </Link>

          {/* Desktop Menu Items (Center) */}
          <div className="collapse navbar-collapse d-none d-lg-flex">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/" style={{ color: '#ffffff' }}>
                  <FaHome className="me-2" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/rooms" style={{ color: '#ffffff' }}>
                  <FaBed className="me-2" />
                  Rooms
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/hotels" style={{ color: '#ffffff' }}>
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
                    style={{ cursor: 'pointer', color: '#ffffff' }}
                  >
                    <FaPlus className="me-2" />
                    Rentify
                  </button>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center mx-2" to="/shop" style={{ color: '#ffffff' }}>
                  <FaStore className="me-2" />
                  Shop
                </Link>
              </li>
            </ul>

            {/* Desktop Right Side Menu */}
            <ul className="navbar-nav">
              {/* Notifications Dropdown */}
              {token && (
                <li className="nav-item d-flex align-items-center">
                  <NotificationBellDisplay bellIcon={<FaBell style={{ fontSize: '16px', color: '#ffffff' }} />} />
                </li>
              )}

              {/* User Profile Dropdown */}
              {token ? (
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <button
                    className="nav-link btn border-0 bg-transparent d-flex align-items-center px-3 py-2"
                    onClick={toggleUserDropdown}
                    style={{ 
                      cursor: 'pointer', 
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '25px',
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    >
                      <FaUser />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {userInfo.name || 'User'}
                    </span>
                  </button>
                  
                  <ul 
                    className={`dropdown-menu dropdown-menu-end ${isUserDropdownOpen ? 'show' : ''}`}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      minWidth: '220px',
                      marginTop: '8px'
                    }}
                  >
                    {userRole === "owner" ? (
                      <>
                        <li>
                          <h6 
                            className="dropdown-header" 
                            style={{ 
                              color: '#ffffff', 
                              fontSize: '12px', 
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: '600',
                              padding: '12px 16px 8px'
                            }}
                          >
                            Owner Panel
                          </h6>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to="/profile" 
                            onClick={closeUserDropdown}
                            style={{
                              color: '#ffffff',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaUser className="me-2" style={{ color: '#ffffff', fontSize: '14px' }} />
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to="/my-listings" 
                            onClick={closeUserDropdown}
                            style={{
                              color: '#ffffff',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaList className="me-2" style={{ color: '#ffffff', fontSize: '14px' }} />
                            My Listings
                          </Link>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to="/owner-dashboard" 
                            onClick={closeUserDropdown}
                            style={{
                              color: '#ffffff',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaTachometerAlt className="me-2" style={{ color: '#ffffff', fontSize: '14px' }} />
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <hr 
                            className="dropdown-divider" 
                            style={{ 
                              borderColor: 'rgba(255, 255, 255, 0.2)', 
                              margin: '8px 0' 
                            }} 
                          />
                        </li>
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => { handleLogout(); closeUserDropdown(); }}
                            style={{
                              color: '#ff6b6b',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaSignOutAlt className="me-2" style={{ color: '#ff6b6b', fontSize: '14px' }} />
                            Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <h6 
                            className="dropdown-header" 
                            style={{ 
                              color: '#ffffff', 
                              fontSize: '12px', 
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: '600',
                              padding: '12px 16px 8px'
                            }}
                          >
                            User Panel
                          </h6>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to="/profile" 
                            onClick={closeUserDropdown}
                            style={{
                              color: '#ffffff',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaUser className="me-2" style={{ color: '#ffffff', fontSize: '14px' }} />
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link 
                            className="dropdown-item" 
                            to="/saved-rooms" 
                            onClick={closeUserDropdown}
                            style={{
                              color: '#ffffff',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaHeart className="me-2" style={{ color: '#ffffff', fontSize: '14px' }} />
                            Saved Properties
                          </Link>
                        </li>
                        <li>
                          <hr 
                            className="dropdown-divider" 
                            style={{ 
                              borderColor: 'rgba(255, 255, 255, 0.2)', 
                              margin: '8px 0' 
                            }} 
                          />
                        </li>
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => { handleLogout(); closeUserDropdown(); }}
                            style={{
                              color: '#ff6b6b',
                              padding: '10px 16px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <FaSignOutAlt className="me-2" style={{ color: '#ff6b6b', fontSize: '14px' }} />
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
                    className="btn btn-light" 
                    onClick={handleLoginModalShow}
                    style={{ border: 'none', backgroundColor: '#ffffff', color: '#212529' }}
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
          className={`mobile-sidebar position-fixed h-100 shadow-lg ${isMobileSidebarOpen ? 'open' : ''}`}
          style={{
            top: 0,
            left: isMobileSidebarOpen ? '0' : '-300px',
            width: '280px',
            zIndex: 1050,
            transition: 'left 0.3s ease',
            overflowY: 'auto',
            backgroundColor: '#212529'
          }}
        >
          {/* Sidebar Header */}
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#343a40', borderBottomColor: '#495057 !important' }}>
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
                      width: 28px; height: 28px; background-color: #212529; 
                      border-radius: 6px; color: #fff; font-weight: 900; 
                      font-size: 14px; font-family: Arial Black, sans-serif;
                    `;
                    textLogo.textContent = 'R';
                    e.target.parentNode.insertBefore(textLogo, e.target);
                  }
                }}
              />
              <h5 className="mb-0 fw-bold" style={{ color: '#ffffff' }}>RoomRento</h5>
            </div>
            <button 
              className="btn btn-link p-0"
              onClick={closeMobileSidebar}
              style={{ fontSize: '20px', color: '#ffffff' }}
            >
              <FaTimes />
            </button>
          </div>

          {/* User Info Section */}
          {token && (
            <div className="p-3 border-bottom" style={{ backgroundColor: '#343a40', borderBottomColor: '#495057 !important' }}>
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#212529',
                    color: 'white'
                  }}
                >
                  <FaUser style={{ fontSize: '16px' }} />
                </div>
                <div>
                  <h6 className="mb-0" style={{ color: '#ffffff' }}>{userInfo.name || 'User'}</h6>
                  <small className="text-light">{userInfo.email}</small>
                  <div>
                    <span className={`badge ${userRole === 'owner' ? 'bg-success' : 'bg-dark'}`}>
                      {userRole === 'owner' ? 'Property Owner' : 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex-grow-1 d-flex flex-column">
            <ul className="list-unstyled mb-0">
              <li>
                <Link 
                  className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                  to="/"
                  onClick={closeMobileSidebar}
                  style={{ 
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FaHome className="me-3" style={{ color: '#ffffff', fontSize: '16px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                  to="/rooms"
                  onClick={closeMobileSidebar}
                  style={{ 
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FaBed className="me-3" style={{ color: '#ffffff', fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>Rooms</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                  to="/hotels"
                  onClick={closeMobileSidebar}
                  style={{ 
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FaBuilding className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>Hotels</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                  to="/shop"
                  onClick={closeMobileSidebar}
                  style={{ 
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FaStore className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>Shop</span>
                </Link>
              </li>
            </ul>

            {/* Role-based Menu */}
            {token && (
              <>
                <div className="px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <h6 className="text-light text-uppercase small mb-0" style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '600' }}>
                    {userRole === 'owner' ? 'Owner Panel' : 'User Panel'}
                  </h6>
                </div>
                <ul className="list-unstyled mb-0">
                  {userRole === "owner" ? (
                    <>
                      <li>
                        <button 
                          className="btn text-decoration-none d-flex align-items-center p-3 nav-link-mobile w-100 text-start border-0 bg-transparent"
                          onClick={() => { handleRentifyClick(); closeMobileSidebar(); }}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaPlus className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>Add Property</span>
                        </button>
                      </li>
                      <li>
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                          to="/my-listings"
                          onClick={closeMobileSidebar}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaList className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>My Listings</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                          to="/owner-dashboard"
                          onClick={closeMobileSidebar}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaTachometerAlt className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                          to="/profile"
                          onClick={closeMobileSidebar}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaUser className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>Profile</span>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                          to="/saved-rooms"
                          onClick={closeMobileSidebar}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaHeart className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>Saved Properties</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="text-decoration-none d-flex align-items-center p-3 nav-link-mobile"
                          to="/profile"
                          onClick={closeMobileSidebar}
                          style={{ 
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FaUser className="me-3" style={{ color: '#ffffff', fontSize: '18px' }} />
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>Profile</span>
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                {/* Login/Logout */}
                <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                  {!token ? (
                    <button 
                      className="btn w-100 d-flex align-items-center justify-content-center"
                      onClick={() => { handleLoginModalShow(); closeMobileSidebar(); }}
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                    >
                      <FaUser className="me-2" />
                      <span style={{ fontWeight: '500' }}>Login</span>
                    </button>
                  ) : (
                    <button 
                      className="btn w-100 d-flex align-items-center justify-content-center"
                      onClick={() => { handleLogout(); closeMobileSidebar(); }}
                      style={{ 
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        border: '1px solid rgba(220, 53, 69, 0.3)',
                        color: '#ffffff',
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.3)';
                        e.target.style.borderColor = 'rgba(220, 53, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
                        e.target.style.borderColor = 'rgba(220, 53, 69, 0.3)';
                      }}
                    >
                      <FaSignOutAlt className="me-2" />
                      <span style={{ fontWeight: '500' }}>Logout</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    </>
  );
};

export default ResponsiveNavbar;
