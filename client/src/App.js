import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";

// Components
import NotFound404 from "./components/404";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AddHotel from "./components/AddHotel";
import AddShop from "./components/AddShop";
import AuthForm from "./components/AuthForm";
import HelpSupport from "./components/HelpSupport";
import Hotels from "./components/Hotels";
import Shop from "./components/Shop";
import MyListings from "./components/MyListings";
import MyBookings from "./components/MyBookings";
import MyBookingRequests from "./components/MyBookingRequests";
import OwnerDashboard from "./components/OwnerDashboard";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import NotificationBell from "./components/NotificationBell";
import NotificationsPage from "./components/NotificationsPage";

// Homepage Sections
import HeroSection from "./components/HeroSection";
import RoomSearchForm from "./components/RoomSearchForm";
import FeaturesSection from "./components/FeaturesSection";
import AboutSection from "./components/AboutSection";
import TestimonialsSection from "./components/TestimonialsSection";
import RoomCardSection from "./components/RoomCardSection";
import AllPropertiesSection from "./components/AllPropertiesSection";

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import './styles/responsive.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userInfo, setUserInfo] = useState({ 
    name: localStorage.getItem("userName") || "", 
    email: localStorage.getItem("email") || "" 
  });
  const [filters, setFilters] = useState({
    location: "",
    roomType: "",
    budget: "",
    roomCategory: ""
  });
  const [showRentifyModal, setShowRentifyModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const AppContent = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    // Reset body padding
    useEffect(() => {
      document.body.style.paddingBottom = '0px';
      
      return () => {
        document.body.style.paddingBottom = '0px';
      };
    }, []); // No dependencies needed since we always set the same value

  // Homepage Component
  const Homepage = () => (
    <>
      <HeroSection />
      <div className="container my-5">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-7 col-12">
            <RoomSearchForm
              filters={filters}
              onChange={handleRoomSearchChange}
              onSubmit={handleRoomSearchSubmit}
            />
          </div>
          <div className="col-lg-5 col-12 d-flex justify-content-center align-items-start">
            <RoomCardSection />
          </div>
        </div>
      </div>
      <AllPropertiesSection filters={filters} />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
    </>
  );

  // Route Guards
  const PrivateRoute = ({ children }) => token ? children : <Navigate to="/login" />;
  const OwnerRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    if (!token) return <Navigate to="/login" />;
    if (role !== 'owner') return <Navigate to="/" />;
    return children;
  };

  // Event Handlers
  const handleRoomSearchChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSearchSubmit = (updatedFilters) => setFilters(updatedFilters);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  const handleRentifyClick = () => {
    setShowRentifyModal(true);
    closeDropdown();
  };
  const handleRentifyClose = () => setShowRentifyModal(false);
  const handleRentifyOption = (option) => {
    setShowRentifyModal(false);
    const routes = { room: '/add-room', hotel: '/add-hotel', shop: '/add-shop' };
    if (routes[option]) window.location.href = routes[option];
  };
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      setToken("");
      setUserInfo({ name: "", email: "" });
      window.location.href = "/login";
    }
  };

    return (
      <>
        {/* Navbar - Hidden on login page */}
        {!isLoginPage && (
          <nav className="navbar navbar-expand-lg sticky-top shadow-sm bg-white navbar-mobile-fix">
            <div className="container-fluid px-3 px-lg-4">
              {/* Brand */}
              <Link className="navbar-brand d-flex align-items-center" to="/">
                <div 
                  className="me-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#6f42c1',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '900',
                    fontSize: '16px'
                  }}
                >
                  R
                </div>
                <span className="fw-bold fs-5 fs-sm-4">RoomRento</span>
              </Link>
              
              {/* Mobile Toggle */}
              <div className="d-lg-none">
                {token ? (
                  <button 
                    className="btn btn-link border-0 p-1" 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#mobileNavbar"
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center" 
                      style={{
                        width: '36px', 
                        height: '36px', 
                        backgroundColor: '#0d6efd', 
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </button>
                ) : (
                  <button 
                    className="navbar-toggler border-0 p-2" 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#mobileNavbar"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                )}
              </div>
              
              {/* Desktop Menu */}
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav ms-auto align-items-lg-center">
                  <li className="nav-item me-lg-2">
                    <Link className="nav-link px-3 py-2 rounded" to="/">
                      <i className="bi bi-house me-1"></i>
                      <span className="d-lg-inline d-none">Home</span>
                    </Link>
                  </li>
                  <li className="nav-item me-lg-2">
                    <Link className="nav-link px-3 py-2 rounded" to="/rooms">
                      <i className="bi bi-door-open me-1"></i>
                      <span className="d-lg-inline d-none">Rooms</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/hotels"><i className="bi bi-building me-1"></i>Hotels</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/shop"><i className="bi bi-shop me-1"></i>Shop</Link>
                  </li>
                  
                  {token && localStorage.getItem("role") === "owner" && (
                    <li className="nav-item">
                      <button 
                        className="nav-link btn btn-link border-0"
                        onClick={handleRentifyClick}
                      >
                        <i className="bi bi-plus-circle me-1"></i>Rentify
                      </button>
                    </li>
                  )}
                  
                  {token && (
                    <li className="nav-item me-2">
                      <NotificationBell />
                    </li>
                  )}
                  
                  {token ? (
                    <li className="nav-item dropdown ms-3">
                      <button 
                        className="nav-link dropdown-toggle d-flex align-items-center btn btn-link border-0" 
                        onClick={toggleDropdown}
                      >
                        <div 
                          className="rounded-circle me-2 d-flex align-items-center justify-content-center" 
                          style={{
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: '#0d6efd', 
                            color: 'white'
                          }}
                        >
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span>{userInfo.name || 'User'}</span>
                      </button>
                      
                      {dropdownOpen && (
                        <ul className="dropdown-menu dropdown-menu-end show">
                          <li className="px-3 py-2 border-bottom">
                            <h6 className="mb-0">{userInfo.name || 'User'}</h6>
                            <small className="text-muted">{userInfo.email}</small>
                          </li>
                          <li><Link className="dropdown-item" to="/profile" onClick={closeDropdown}>Profile</Link></li>
                          
                          {localStorage.getItem("role") === "owner" ? (
                            <>
                              <li><Link className="dropdown-item" to="/owner-dashboard" onClick={closeDropdown}>Dashboard</Link></li>
                              <li><Link className="dropdown-item" to="/my-listings" onClick={closeDropdown}>My Listings</Link></li>
                            </>
                          ) : (
                            <li><Link className="dropdown-item" to="/my-booking-requests" onClick={closeDropdown}>My Bookings</Link></li>
                          )}
                          
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                              Logout
                            </button>
                          </li>
                        </ul>
                      )}
                    </li>
                  ) : (
                    <li className="nav-item">
                      <Link className="btn btn-primary px-4" to="/login">Login</Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </nav>
        )}

        {/* Mobile Offcanvas */}
        {!isLoginPage && (
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="mobileNavbar">
            <div className="offcanvas-header bg-primary text-white">
              <h5 className="offcanvas-title">Menu</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/" data-bs-dismiss="offcanvas">
                    <i className="bi bi-house me-2"></i>Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/rooms" data-bs-dismiss="offcanvas">
                    <i className="bi bi-door-open me-2"></i>Rooms
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/hotels" data-bs-dismiss="offcanvas">
                    <i className="bi bi-building me-2"></i>Hotels
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/shop" data-bs-dismiss="offcanvas">
                    <i className="bi bi-shop me-2"></i>Shop
                  </Link>
                </li>
                
                {!token && (
                  <>
                    <li><hr /></li>
                    <li className="nav-item">
                      <Link className="nav-link text-primary fw-medium" to="/login" data-bs-dismiss="offcanvas">
                        <i className="bi bi-person-plus me-2"></i>Login / Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main 
          className="main-content" 
          style={{
            paddingBottom: token && !isLoginPage ? '75px' : '0',
            minHeight: 'calc(100vh - 65px)'
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={token ? <Navigate to="/" /> : <AuthForm setToken={setToken} />} />
            <Route path="/shop" element={<Shop />} />
            
            {/* Protected Routes */}
            <Route path="/rooms" element={<PrivateRoute><RoomsList filters={filters} /></PrivateRoute>} />
            <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
            <Route path="/room/:id" element={<PrivateRoute><RoomDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/help" element={<PrivateRoute><HelpSupport /></PrivateRoute>} />
            <Route path="/my-booking-requests" element={<PrivateRoute><MyBookingRequests /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            
            {/* Owner Routes */}
            <Route path="/owner-dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
            <Route path="/add-property" element={<OwnerRoute><AddRoom token={token} /></OwnerRoute>} />
            <Route path="/add-room" element={<OwnerRoute><AddRoom token={token} /></OwnerRoute>} />
            <Route path="/add-hotel" element={<OwnerRoute><AddHotel token={token} /></OwnerRoute>} />
            <Route path="/add-shop" element={<OwnerRoute><AddShop token={token} /></OwnerRoute>} />
            <Route path="/my-listings" element={<OwnerRoute><MyListings /></OwnerRoute>} />
            <Route path="/my-bookings" element={<OwnerRoute><MyBookings /></OwnerRoute>} />
            <Route path="/edit-property/:id" element={<OwnerRoute><AddRoom token={token} isEdit={true} /></OwnerRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        </main>

        {/* Footer - Hidden on login page */}
        {!isLoginPage && (
          <div style={{ marginBottom: token ? '75px' : '0', paddingBottom: '20px' }}>
            <Footer />
          </div>
        )}

        {/* BottomNav - Fixed at bottom for mobile only */}
        {!isLoginPage && token && <BottomNav />}

        {/* Rentify Modal */}
        <Modal show={showRentifyModal} onHide={handleRentifyClose} centered>
          <Modal.Header closeButton style={{background: 'linear-gradient(135deg, #6f42c1 0%, #000 100%)', color: 'white', border: 'none'}}>
            <Modal.Title>
              <i className="bi bi-plus-circle me-2"></i>
              Choose What to Rentify
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{padding: '2rem'}}>
            <div className="d-grid gap-3">
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('room')}
                className="d-flex align-items-center justify-content-start p-3"
                style={{border: '2px solid #6f42c1', borderRadius: '12px'}}
              >
                <i className="bi bi-house-door me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1'}}>Room</div>
                  <small style={{color: '#000'}}>Rent out your room or apartment</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('hotel')}
                className="d-flex align-items-center justify-content-start p-3"
                style={{border: '2px solid #6f42c1', borderRadius: '12px'}}
              >
                <i className="bi bi-building me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1'}}>Hotel</div>
                  <small style={{color: '#000'}}>List your hotel or guesthouse</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('shop')}
                className="d-flex align-items-center justify-content-start p-3"
                style={{border: '2px solid #6f42c1', borderRadius: '12px'}}
              >
                <i className="bi bi-shop me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1'}}>Shop</div>
                  <small style={{color: '#000'}}>Rent out your commercial space</small>
                </div>
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer style={{border: 'none', padding: '0 2rem 2rem 2rem'}}>
            <Button variant="light" onClick={handleRentifyClose} style={{borderRadius: '8px'}}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
