import { useState } from "react";
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
    <div className={`main ${isLogin ? "" : "sign-up-mode"}`}>
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <h2>{isLogin ? "Login" : "Register"}</h2>

          {!isLogin && (
            <>
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
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
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          {isLogin && (
            <div className="google-login">
              <span>or</span>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </div>
          )}

          <p className="toggle">
            {isLogin ? "Don't have an account?" : "Already have one?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;
