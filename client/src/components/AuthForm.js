import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "./AuthForm.css";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    setLoading(true);

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(`${BASE_URL}${endpoint}`, payload);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
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
      const res = await axios.post(`${BASE_URL}/auth/google-login`, {
        email: decoded.email,
        name: decoded.name,
      });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      alert("Google Login Successful!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login And Continue" : "Register"}</h2>
        {!isLogin && (
          <>
            <div className="flex">
              <input
                type="text"
                name="firstname"
                placeholder="Firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastname"
                placeholder="Lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="renter">Renter</option>
              <option value="owner">Owner</option>
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : isLogin ? "Login" : "Register"}
        </button>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

        {isLogin && (
          <>
            <div className="separator">
              <hr className="line" />
              <span>Or</span>
              <hr className="line" />
            </div>
            <div className="google-btn">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default AuthForm;
