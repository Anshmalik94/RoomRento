import React from "react";
import { Link } from "react-router-dom";

export default function NotFound404() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white text-center p-4">
      <div className="mb-4">
        <i className="bi bi-emoji-frown" style={{ fontSize: "5rem", color: "#6f42c1" }}></i>
      </div>
      <h1 className="fw-bold mb-2" style={{ color: "#000" }}>Oops! Page not found</h1>
      <p className="mb-4 text-black-50">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-lg px-4 py-2 fw-semibold" style={{ background: "#6f42c1", color: "#fff" }}>
        <i className="bi bi-house me-2"></i>Go to Home
      </Link>
    </div>
  );
}
