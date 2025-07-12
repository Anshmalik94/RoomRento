import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // Getting role from localStorage

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light shadow-sm py-3 fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">RoomRento</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rooms">Rooms</Link>
            </li>

            {token && role === "owner" && (
              <li className="nav-item">
                <Link className="nav-link" to="/add-room">Add Room</Link>
              </li>
            )}

            <li className="nav-item">
              {token ? (
                <button className="btn btn-outline-primary ms-2" onClick={handleLogout} type="button">Logout</button>
              ) : (
                <Link className="btn btn-primary ms-2" to="/login">Login</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
