import { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./AuthForm.css";

function AuthForm({ setToken }) {
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
  const navigate = useNavigate();

  // Add and remove body class for login page background
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    setLoading(true);

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(`${BASE_URL}${endpoint}`, payload);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", formData.email);
      if (res.data.name) {
        localStorage.setItem("userName", res.data.name);
      }
      alert(isLogin ? "Login Successful!" : "Registration Successful!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // Debug: Google user data processed
      
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
      
      alert("Google Login Successful!");
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.response?.data?.msg || "Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-main-container">
      <div className="auth-container">
        {/* ROOMRENTO Title */}
        <h1 className="auth-brand-title">ROOMRENTO</h1>
        
        {/* Logo */}
        <div className="auth-logo-container">
          <img 
            src="/images/logo.png"
            alt="RoomRento Logo" 
            className="auth-logo-img"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              margin: '0 auto 20px auto',
              display: 'block'
            }}
            onError={(e) => {
              e.target.src = "/logo56.png";
              e.target.onerror = () => {
                e.target.style.display = 'none';
              };
            }}
          />
        </div>
        
        {/* Welcome back text */}
        <h2 className="auth-welcome-text">Welcome back</h2>
        
        {/* Google Login Button - Show for both login and register */}
        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
      // Login failed
              alert("Google Login Failed");
            }}
          />
        </div>
        
        {/* Or divider */}
        <div className="auth-divider">or</div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="register-form-grid">
                <div className="auth-input-group">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                
                <div className="auth-input-group">
                  <i className="fas fa-user input-icon"></i>
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
              
              <div className="role-selector">
                <i className="fas fa-users input-icon"></i>
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
          <div className="auth-input-group">
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
          <div className="auth-input-group">
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
            <div className="auth-input-group">
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
          <button type="submit" className="auth-continue-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Continue'
            )}
          </button>
          
          {/* Terms and Privacy */}
          <div className="auth-terms">
            By continuing, you agree to our Terms and Privacy Policy.
          </div>
        </form>
        
        {/* Toggle between Login/Register */}
        <div className="toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
