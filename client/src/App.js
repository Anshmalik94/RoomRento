// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AuthForm from "./components/AuthForm";
import HelpSupport from "./components/HelpSupport";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import HeroSection from "./components/HeroSection";
import RoomSearchForm from "./components/RoomSearchForm";
import FeaturesSection from "./components/FeaturesSection";
import AboutSection from "./components/AboutSection";
import TestimonialsSection from "./components/TestimonialsSection";
import RoomCardSection from "./components/RoomCardSection";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [filters, setFilters] = useState({
    location: "",
    roomType: "",
    budget: "",
    roomCategory: ""
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  const showLayout = token;

  const handleRoomSearchChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSearchSubmit = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  return (
    <Router>
      {showLayout && <Navbar token={token} setToken={setToken} />}

      <Routes>
        <Route
          path="/login"
          element={
            token ? <Navigate to="/" /> : <AuthForm setToken={setToken} />
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
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

                {/* 👇 RoomsList moved here just after filters */}
                <RoomsList filters={filters} />

                {/* 👇 Other sections moved below */}
                <FeaturesSection />
                <AboutSection />
                <TestimonialsSection />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/room/:id"
          element={
            <PrivateRoute>
              <RoomDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-room"
          element={
            <PrivateRoute>
              <AddRoom token={token} />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <HelpSupport />
            </PrivateRoute>
          }
        />
      </Routes>

      {showLayout && <Footer />}
    </Router>
  );
}

export default App;
