import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import BASE_URL from "../config";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import ToastMessage from "./ToastMessage";
import "./AuthModal.css";

function AuthModal({ show, onHide, setToken, onSuccessRedirect }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter",
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToastMessage = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showToastMessage("Passwords do not match!", "error");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    setLoading(true);

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            ...formData,
            name: `${formData.firstname} ${formData.lastname}`.trim()
          };

      const res = await axios.post(`${BASE_URL}${endpoint}`, payload);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", formData.email);
      
      // Store name from response or construct from form data
      const userName = res.data.user?.name || 
                      res.data.name || 
                      `${formData.firstname} ${formData.lastname}`.trim() ||
                      formData.email.split('@')[0];
      
      localStorage.setItem("userName", userName);
      
      showToastMessage(isLogin ? "Login Successful!" : "Registration Successful!", "success");
      
      // Close modal and redirect after short delay
      setTimeout(() => {
        onHide();
        if (onSuccessRedirect) {
          onSuccessRedirect();
        }
      }, 1500);
    } catch (err) {
      showToastMessage(err.response?.data?.msg || "Failed, please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const res = await axios.post(`${BASE_URL}/api/auth/google-login`, {
        email: decoded.email,
        name: decoded.name || `${decoded.given_name} ${decoded.family_name}`,
        picture: decoded.picture
      });
      
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", decoded.email);
      localStorage.setItem("userName", decoded.name || `${decoded.given_name} ${decoded.family_name}`);
      
      showToastMessage("Google Login Successful!", "success");
      
      // Close modal and redirect after short delay
      setTimeout(() => {
        onHide();
        if (onSuccessRedirect) {
          onSuccessRedirect();
        }
      }, 1500);
    } catch (err) {
      console.error("Google login error:", err);
      showToastMessage(err.response?.data?.msg || "Google Login Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "renter",
    });
    setIsLogin(true);
  };

  const handleModalHide = () => {
    resetForm();
    onHide();
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleModalHide} 
        centered 
        className="auth-modal"
        backdrop={true}
        keyboard={true}
      >
      <Modal.Body className="p-0">
        <div className="auth-modal-container">
          {/* Close button */}
          <button 
            type="button" 
            className="btn-close auth-modal-close" 
            onClick={handleModalHide}
            aria-label="Close"
          >
            ×
          </button>
          
          {/* ROOMRENTO Title */}
          <h1 className="auth-modal-brand-title">ROOMRENTO</h1>
          
          {/* Logo */}
          <div className="auth-modal-logo-container">
            <img 
              src="/images/logo.png"
              alt="RoomRento official logo" 
              className="auth-modal-logo-img"
              onError={(e) => {
                e.target.src = "/logo56.png";
                e.target.onerror = () => {
                  e.target.style.display = 'none';
                };
              }}
              loading="lazy"
            />
          </div>
          
          {/* Welcome back text */}
          <h2 className="auth-modal-welcome-text">Welcome back</h2>
          
          {/* Google Login Button */}
          <div className="auth-modal-google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                showToastMessage("Google Login Failed", "error");
              }}
            />
          </div>
          
          {/* Or divider */}
          <div className="auth-modal-divider"></div>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="auth-modal-register-form-grid">
                  <div className="auth-modal-input-group">
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                    />
                  </div>
                  
                  <div className="auth-modal-input-group">
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
                
                <div className="auth-modal-input-group auth-modal-role-selector">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="renter">Renter</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Email Input */}
            <div className="auth-modal-input-group">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="auth-modal-input-group">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>
            
            {!isLogin && (
              <div className="auth-modal-input-group">
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            )}
            
            {/* Continue Button */}
            <button type="submit" className="auth-modal-continue-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Continue'
              )}
            </button>
            
            {/* Terms and Privacy */}
            <div className="auth-modal-terms">
              By continuing, you agree to our Terms and Privacy Policy.
            </div>
          </form>
          
          {/* Toggle between Login/Register */}
          <div className="auth-modal-toggle">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
      </Modal.Body>
    </Modal>
    
    {/* Toast Message */}
    <ToastMessage
      show={showToast}
      onClose={() => setShowToast(false)}
      message={toastMessage}
      type={toastType}
      duration={4000}
    />
    </>
  );
}

export default AuthModal;
