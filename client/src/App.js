import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { Helmet } from "react-helmet-async";

// Contexts
import { NotificationProvider } from "./contexts/NotificationContext";

// Global CSS fixes
import "./components/ButtonTextFix.css";
import "./styles/mobile-enhancements.css";
import "./styles/responsive-framework.css";

// Components
import ResponsiveNavbar from "./components/ResponsiveNavbar";
import ToastMessage from "./components/ToastMessage";
import NotFound404 from "./components/404";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AddHotel from "./components/AddHotel";
import AddShop from "./components/AddShop";
import AuthModal from "./components/AuthModal";
import HelpSupport from "./components/HelpSupport";
import Hotels from "./components/Hotels";
import Shop from "./components/Shop";
import MyListings from "./components/MyListings";
import MyBookings from "./components/MyBookings";
import MyBookingRequests from "./components/MyBookingRequests";
import OwnerDashboard from "./components/OwnerDashboard";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer.jsx";
import NotificationsPage from "./components/NotificationsPage";
import ScrollToTop from "./components/ScrollToTop";
import SavedProperties from "./components/SavedProperties";

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
import './styles/navbar.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userInfo, setUserInfo] = useState({ 
    name: localStorage.getItem("userName") || "", 
    email: localStorage.getItem("email") || "" 
  });
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  // Check PWA installation status
  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      const wasInstalled = localStorage.getItem('roomrento-pwa-installed') === 'true';
      
      const installed = isStandalone || isIOSStandalone || wasInstalled;
      
      // Add CSS class to body for styling purposes
      if (installed) {
        document.body.classList.add('pwa-installed');
      } else {
        document.body.classList.remove('pwa-installed');
      }
    };

    checkPWAStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkPWAStatus();
    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);
  
  // Toast message function
  const showToastMessage = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };
  const [showRentifyModal, setShowRentifyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Homepage Component - Moved outside AppContent
  const Homepage = () => (
    <>
      <HeroSection />
      <div className="container my-5">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-7 col-12 order-1 order-lg-1">
            <RoomSearchForm
              token={token}
              onLoginRequired={() => setShowLoginModal(true)}
            />
          </div>
          <div className="col-lg-5 col-12 order-2 order-lg-2 d-flex justify-content-center align-items-start">
            <RoomCardSection />
          </div>
        </div>
      </div>
      <AllPropertiesSection 
        token={token}
        onLoginRequired={() => setShowLoginModal(true)}
      />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
    </>
  );

  // Route Guards - Moved outside AppContent
  const PrivateRoute = ({ children }) => token ? children : <Navigate to="/" />;
  const OwnerRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    if (!token) return <Navigate to="/" />;
    if (role !== 'owner') return <Navigate to="/" />;
    return children;
  };

  const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoginPage = location.pathname === '/login';

    // Reset body padding
    useEffect(() => {
      document.body.style.paddingBottom = '0px';
      
      return () => {
        document.body.style.paddingBottom = '0px';
      };
    }, []); // No dependencies needed since we always set the same value

    // Reset body padding
    useEffect(() => {
      document.body.style.paddingBottom = '0px';
      
      return () => {
        document.body.style.paddingBottom = '0px';
      };
    }, []); // No dependencies needed since we always set the same value

    // Force logout listener for token expiration
    useEffect(() => {
      const handleForceLogout = (event) => {
        // Clear all localStorage data
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("email");
        
        // Update state
        setToken("");
        setUserInfo({ name: "", email: "" });
        
        // Show notification to user
        setToastMessage(event.detail.reason || 'Session expired. Please login again.');
        setToastType('warning');
        setShowToast(true);
        
        // Redirect to login
        navigate('/login');
      };

      window.addEventListener('forceLogout', handleForceLogout);
      
      return () => {
        window.removeEventListener('forceLogout', handleForceLogout);
      };
    }, [navigate]);

    // Event Handlers - moved inside AppContent to access navigate
    const handleLoginSuccess = () => {
      // Update token state with latest data from localStorage
      const latestToken = localStorage.getItem("token") || "";
      setToken(latestToken);
      
      // Update userInfo with latest data from localStorage
      setUserInfo({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("email") || ""
      });
      
      // Show login success toast message
      showToastMessage("Welcome back! Login successful!", "success");
      
      // Close login modal first
      setShowLoginModal(false);
      
      // Redirect to homepage after successful login
      setTimeout(() => {
        navigate('/');
      }, 500);
    };

    const handleRentifyOption = (option) => {
      setShowRentifyModal(false);
      const routes = { room: '/add-room', hotel: '/add-hotel', shop: '/add-shop' };
      if (routes[option]) {
        navigate(routes[option]);
      }
    };

    const handleLogout = () => {
      localStorage.clear();
      setToken("");
      setUserInfo({ name: "", email: "" });
      showToastMessage("Logged out successfully!", "success");
      setTimeout(() => navigate("/"), 1000);
    };

    // Event Handlers
    const handleRentifyClick = () => {
      setShowRentifyModal(true);
    };
    const handleRentifyClose = () => setShowRentifyModal(false);
    const handleLoginModalShow = () => setShowLoginModal(true);
    const handleLoginModalHide = () => setShowLoginModal(false);

    // Get user role
    const userRole = localStorage.getItem("role"); // "owner" or "user"

    return (
      <>
        {/* Toast Messages */}
        <ToastMessage 
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
        
        {/* Responsive Navbar Component */}
        {!isLoginPage && (
          <ResponsiveNavbar 
            token={token}
            userInfo={userInfo}
            userRole={userRole}
            handleLogout={handleLogout}
            handleRentifyClick={handleRentifyClick}
            handleLoginModalShow={handleLoginModalShow}
          />
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
            <Route path="/login" element={token ? <Navigate to="/" /> : <Navigate to="/" />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/notifications-test" element={<NotificationsPage />} />
            
            {/* Protected Routes */}
            <Route path="/rooms" element={<PrivateRoute><RoomsList filters={{}} /></PrivateRoute>} />
            <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
            <Route path="/room/:id" element={<PrivateRoute><RoomDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/help" element={<PrivateRoute><HelpSupport /></PrivateRoute>} />
            <Route path="/my-booking-requests" element={<PrivateRoute><MyBookingRequests /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/saved-rooms" element={<PrivateRoute><SavedProperties /></PrivateRoute>} />
            
            {/* Owner Routes */}
            <Route path="/owner-dashboard" element={<OwnerRoute><OwnerDashboard handleRentifyClick={handleRentifyClick} /></OwnerRoute>} />
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

        {/* BottomNav - Fixed at bottom for mobile only */}
        {!isLoginPage && token && <BottomNav handleRentifyClick={handleRentifyClick} />}

        {/* Rentify Modal */}
        <Modal 
          show={showRentifyModal} 
          onHide={handleRentifyClose} 
          centered
          size="md"
          className="rentify-modal"
          dialogClassName="modal-dialog-centered rentify-modal-dialog"
          style={{ zIndex: 1060 }}
        >
          <Modal.Header 
            closeButton 
            style={{
              background: 'linear-gradient(135deg, #6f42c1 0%, #000 100%)', 
              color: 'white', 
              border: 'none',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Modal.Title className="fw-bold">
              <i className="bi bi-plus-circle me-2"></i>
              Choose What to Rentify
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{padding: '2rem', background: '#f8f9fa'}}>
            <div className="text-center mb-4">
              <h6 className="text-muted mb-0">Select the type of property you want to list</h6>
            </div>
            <div className="d-grid gap-3">
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('room')}
                className="d-flex align-items-center justify-content-start p-4 border-2 hover-lift"
                style={{
                  border: '2px solid #6f42c1', 
                  borderRadius: '16px',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(111, 66, 193, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(111, 66, 193, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.1)';
                }}
              >
                <i className="bi bi-house-door me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1', fontSize: '1.1rem'}}>Room</div>
                  <small style={{color: '#6c757d'}}>Rent out your room or apartment</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('hotel')}
                className="d-flex align-items-center justify-content-start p-4 border-2 hover-lift"
                style={{
                  border: '2px solid #6f42c1', 
                  borderRadius: '16px',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(111, 66, 193, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(111, 66, 193, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.1)';
                }}
              >
                <i className="bi bi-building me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1', fontSize: '1.1rem'}}>Hotel</div>
                  <small style={{color: '#6c757d'}}>List your hotel or guesthouse</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => handleRentifyOption('shop')}
                className="d-flex align-items-center justify-content-start p-4 border-2 hover-lift"
                style={{
                  border: '2px solid #6f42c1', 
                  borderRadius: '16px',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(111, 66, 193, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(111, 66, 193, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.1)';
                }}
              >
                <i className="bi bi-shop me-3" style={{fontSize: '1.5rem', color: '#6f42c1'}}></i>
                <div className="text-start">
                  <div className="fw-bold" style={{color: '#6f42c1', fontSize: '1.1rem'}}>Shop</div>
                  <small style={{color: '#6c757d'}}>Rent out your commercial space</small>
                </div>
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer style={{
            border: 'none', 
            padding: '1rem 2rem 2rem 2rem',
            background: '#f8f9fa',
            borderRadius: '0 0 16px 16px'
          }}>
            <div className="w-100 text-center">
              <Button 
                variant="outline-secondary" 
                onClick={handleRentifyClose} 
                style={{
                  borderRadius: '12px',
                  padding: '0.5rem 2rem',
                  border: '2px solid #6c757d'
                }}
              >
                Cancel
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Auth Modal */}
        <AuthModal 
          show={showLoginModal} 
          onHide={handleLoginModalHide}
          setToken={setToken}
          onSuccessRedirect={handleLoginSuccess}
        />

        <Helmet>
          <meta property="og:title" content="RoomRento - Affordable Rentals" />
          <meta property="og:description" content="Find rooms, PGs, hotels, and shops for rent." />
          <meta property="og:image" content="https://roomrento.com/images/og-banner.png" />
          <meta property="og:url" content="https://roomrento.com/" />
          <meta property="og:type" content="website" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="RoomRento - Easy Rentals" />
          <meta name="twitter:description" content="List or rent properties easily with RoomRento." />
          <meta name="twitter:image" content="https://roomrento.com/images/twitter-banner.png" />
        </Helmet>
      </>
    );
  };

  return (
    <Router>
      <ScrollToTop />
      <NotificationProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AppContent />
            <Footer />
          </div>
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
