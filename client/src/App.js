import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AuthForm from "./components/AuthForm";
import HelpSupport from "./components/HelpSupport";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  // Protected route wrapper
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        {/* If logged in, redirect away from login page */}
        <Route
          path="/login"
          element={
            token ? <Navigate to="/" /> : <AuthForm setToken={setToken} />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RoomsList />
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
      <Footer />
    </Router>
  );
}

export default App;
