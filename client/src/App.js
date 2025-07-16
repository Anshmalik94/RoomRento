import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
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
import { useEffect, useState, useCallback } from "react";
import HeroSection from "./components/HeroSection";
import RoomSearchForm from "./components/RoomSearchForm";
import FeaturesSection from "./components/FeaturesSection";
import AboutSection from "./components/AboutSection";
import TestimonialsSection from "./components/TestimonialsSection";
import RoomCardSection from "./components/RoomCardSection";
import AllPropertiesSection from "./components/AllPropertiesSection";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

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

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownOpen && !event.target.closest('.dropdown')) {
          setDropdownOpen(false);
        }
      };

      const handleRentifyModal = () => {
        setShowRentifyModal(true);
      };

      document.addEventListener('click', handleClickOutside);
      window.addEventListener('openRentifyModal', handleRentifyModal);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('openRentifyModal', handleRentifyModal);
      };
    }, []); // Remove dropdownOpen dependency as it's not needed

    // Function to toggle dropdown
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };

    // Function to close dropdown
    const closeDropdown = () => {
      setDropdownOpen(false);
    };

    // Rentify Modal Functions
    const handleRentifyClick = () => {
      setShowRentifyModal(true);
      closeDropdown();
    };

    const handleRentifyClose = () => {
      setShowRentifyModal(false);
    };

    const handleRentifyOption = (option) => {
      setShowRentifyModal(false);
      // Navigate to appropriate form based on option
      switch (option) {
        case 'room':
          window.location.href = '/add-room';
          break;
        case 'hotel':
          window.location.href = '/add-hotel';
          break;
        case 'shop':
          window.location.href = '/add-shop';
          break;
        default:
          break;
      }
    };

    const PrivateRoute = ({ children }) => {
      return token ? children : <Navigate to="/login" />;
    };

    const OwnerRoute = ({ children }) => {
      const role = localStorage.getItem('role');
      if (!token) return <Navigate to="/login" />;
      if (role !== 'owner') return <Navigate to="/" />;
      return children;
    };

    const handleRoomSearchChange = (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoomSearchSubmit = (updatedFilters) => {
      setFilters(updatedFilters);
    };

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

    return (
      <>
        {/* Modern Navbar with Scroll Effect - Hidden on login page */}
        {!isLoginPage && (
          <>
          <nav className="navbar navbar-expand-lg sticky-top shadow-sm" id="mainNavbar">
          <div className="container">
            {/* Brand */}
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img 
                src="/images/logos/android-chrome-512x512.png" 
                alt="RoomRento" 
                width="40" 
                height="40" 
                className="me-2" 
              />
              <span className="fw-bold">RoomRento</span>
            </Link>
            
            {/* Mobile Toggle */}
            <button 
              className="navbar-toggler border-0" 
              type="button" 
              data-bs-toggle="offcanvas" 
              data-bs-target="#mobileNavbar"
              aria-controls="mobileNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            {/* Desktop Menu */}
            <div className="collapse navbar-collapse" id="navbarNav">
              {/* All Navigation Links - Right Side */}
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/">
                    <i className="bi bi-house me-1"></i>Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/rooms">
                    <i className="bi bi-door-open me-1"></i>Rooms
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/hotels">
                    <i className="bi bi-building me-1"></i>Hotels
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/shop">
                    <i className="bi bi-shop me-1"></i>Shop
                  </Link>
                </li>
                
                {/* Rentify Button - Only for owners */}
                {token && localStorage.getItem("role") === "owner" && (
                  <li className="nav-item">
                    <button 
                      className="nav-link fw-medium btn btn-link border-0 p-0"
                      onClick={handleRentifyClick}
                      style={{ 
                        background: 'none', 
                        color: 'inherit', 
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="bi bi-plus-circle me-1"></i>Rentify
                    </button>
                  </li>
                )}
                
                {token ? (
                  <li className="nav-item dropdown ms-3">
                    <button 
                      className="nav-link dropdown-toggle d-flex align-items-center fw-medium btn btn-link border-0 p-0" 
                      id="userDropdown" 
                      type="button" 
                      onClick={toggleDropdown}
                      aria-expanded={dropdownOpen}
                      style={{ cursor: 'pointer', textDecoration: 'none', background: 'none', color: 'inherit' }}
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-2 d-flex align-items-center justify-content-center" 
                          style={{
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: '#0d6efd', 
                            color: 'white',
                            fontSize: '14px'
                          }}
                        >
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span>{userInfo.name || 'User'}</span>
                      </div>
                    </button>
                    <ul 
                      className={`dropdown-menu dropdown-menu-end shadow ${dropdownOpen ? 'show' : ''}`} 
                      style={{minWidth: '250px', position: 'absolute', top: '100%', right: '0'}}
                    >
                      <li className="px-3 py-2 border-bottom">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle me-2 d-flex align-items-center justify-content-center" 
                            style={{
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: '#0d6efd', 
                              color: 'white'
                            }}
                          >
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">
                              {userInfo.name || 'User'}
                            </h6>
                            <small className="text-muted">
                              {userInfo.email || 'Welcome to RoomRento'}
                            </small>
                          </div>
                        </div>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item py-2" 
                          to="/profile"
                          onClick={closeDropdown}
                        >
                          <i className="bi bi-person me-2 text-primary"></i>View Profile
                        </Link>
                      </li>
                      
                      {localStorage.getItem("role") === "owner" ? (
                        <>
                          <li>
                            <Link 
                              className="dropdown-item py-2" 
                              to="/owner-dashboard"
                              onClick={closeDropdown}
                            >
                              <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link 
                              className="dropdown-item py-2" 
                              to="/my-listings"
                              onClick={closeDropdown}
                            >
                              <i className="bi bi-list-ul me-2 text-primary"></i>My Listings
                            </Link>
                          </li>
                          <li>
                            <Link 
                              className="dropdown-item py-2" 
                              to="/my-bookings"
                              onClick={closeDropdown}
                            >
                              <i className="bi bi-calendar-check me-2 text-primary"></i>My Bookings
                            </Link>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link 
                              className="dropdown-item py-2" 
                              to="/my-booking-requests"
                              onClick={closeDropdown}
                            >
                              <i className="bi bi-calendar-event me-2 text-primary"></i>My Bookings
                            </Link>
                          </li>
                          <li>
                            <Link 
                              className="dropdown-item py-2" 
                              to="/help"
                              onClick={closeDropdown}
                            >
                              <i className="bi bi-question-circle me-2 text-primary"></i>Help & Support
                            </Link>
                          </li>
                        </>
                      )}
                      
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item py-2 text-danger fw-medium w-100 text-start border-0 bg-transparent"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.preventDefault();
                            closeDropdown();
                            if (window.confirm('Are you sure you want to logout?')) {
                              localStorage.clear();
                              setToken("");
                              setUserInfo({ name: "", email: "" });
                              window.location.href = "/login";
                            }
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link className="btn btn-primary btn-pill px-4 py-2" to="/login">
                      <i className="bi bi-box-arrow-in-right me-1"></i>Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
        
        {/* Mobile Offcanvas */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="mobileNavbar">
          <div className="offcanvas-header bg-primary text-white">
            <h5 className="offcanvas-title">Menu</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            {token && (
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2" style={{fontSize: '2rem'}}></i>
                  <div>
                    <h6 className="mb-0">{userInfo.name || 'User'}</h6>
                    <small className="text-muted">{userInfo.email}</small>
                  </div>
                </div>
              </div>
            )}
            
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
              
              {token ? (
                <>
                  <li><hr /></li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" data-bs-dismiss="offcanvas">
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  {localStorage.getItem("role") === "owner" ? (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/owner-dashboard" data-bs-dismiss="offcanvas">
                          <i className="bi bi-speedometer2 me-2"></i>Dashboard
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/my-listings" data-bs-dismiss="offcanvas">
                          <i className="bi bi-list-ul me-2"></i>My Listings
                        </Link>
                      </li>
                    </>
                  ) : (
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-booking-requests" data-bs-dismiss="offcanvas">
                        <i className="bi bi-calendar-event me-2"></i>My Bookings
                      </Link>
                    </li>
                  )}
                  <li><hr /></li>
                  <li className="nav-item">
                    <button 
                      className="nav-link btn btn-link text-danger w-100 text-start" 
                      onClick={() => {
                        localStorage.clear();
                        setToken("");
                        window.location.href = "/login";
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><hr /></li>
                  <li className="nav-item">
                    <Link className="btn btn-primary btn-pill w-100" to="/login" data-bs-dismiss="offcanvas">
                      <i className="bi bi-box-arrow-in-right me-1"></i>Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        </>
        )}

        {/* Main Content */}
        <main className="main-content">
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
          <>
            <Footer />
            <BottomNav />
          </>
        )}

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

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        const updatedUserInfo = { 
          name: userData.name || localStorage.getItem("userName") || 'User', 
          email: userData.email || localStorage.getItem("email") || ''
        };
        setUserInfo(updatedUserInfo);
        if (userData.name) localStorage.setItem("userName", userData.name);
        if (userData.email) localStorage.setItem("email", userData.email);
      }
    } catch (error) {
      console.log('Error fetching user info:', error);
      setUserInfo({
        name: localStorage.getItem("userName") || 'User',
        email: localStorage.getItem("email") || ''
      });
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setUserInfo({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("email") || ""
      });
      fetchUserInfo();
    }
  }, [token, fetchUserInfo]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
