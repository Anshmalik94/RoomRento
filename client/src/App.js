import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";

// Contexts
import { NotificationProvider } from "./contexts/NotificationContext";

// Components
import ResponsiveNavbar from "./components/ResponsiveNavbar";
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
import Footer from "./components/Footer.jsx";
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
  // Old navbar state variables removed - now handled by ResponsiveNavbar component

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

  // Homepage Component
  const Homepage = () => (
    <>
      <HeroSection />
      <div className="homepage-advert mt-4 text-center" style={{background: '#fff', borderRadius: '18px', padding: '8px 0', boxShadow: '0 2px 8px rgba(111,66,193,0.08)', border: '1px solid #e0e0e0', marginBottom: '8px', maxWidth: '900px', width: '96%', marginLeft: 'auto', marginRight: 'auto'}}>
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '1.35rem', color: '#6f42c1', letterSpacing: '0.5px'}}>
          <span role="img" aria-label="sparkles" style={{fontSize: '1.7rem', verticalAlign: 'middle', marginRight: '10px'}}>✨</span>
          Searching for a room, hotel, or shop? RoomRento makes renting and listing easy, fast, and secure for everyone!
          <span role="img" aria-label="home" style={{fontSize: '1.7rem', verticalAlign: 'middle', marginLeft: '10px'}}>🏠</span>
        </div>
      </div>
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
  const handleRentifyClick = () => {
    setShowRentifyModal(true);
  };
  const handleRentifyClose = () => setShowRentifyModal(false);
  const handleRentifyOption = (option) => {
    setShowRentifyModal(false);
    const routes = { room: '/add-room', hotel: '/add-hotel', shop: '/add-shop' };
    if (routes[option]) {
      navigate(routes[option]);
    }
  };

  // Get user role
  const userRole = localStorage.getItem("role"); // "owner" or "user"

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      setToken("");
      setUserInfo({ name: "", email: "" });
      navigate("/login");
    }
  };

    return (
      <>
        {/* Responsive Navbar Component */}
        {!isLoginPage && (
          <ResponsiveNavbar 
            token={token}
            userInfo={userInfo}
            userRole={userRole}
            handleLogout={handleLogout}
            handleRentifyClick={handleRentifyClick}
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



        {/* BottomNav - Fixed at bottom for mobile only */}
        {!isLoginPage && token && <BottomNav handleRentifyClick={handleRentifyClick} />}

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
