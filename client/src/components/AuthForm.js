import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "./AuthForm.css";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function AuthForm({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", role: "renter" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const res = await axios.post(`${BASE_URL}${endpoint}`, formData);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      alert(isLogin ? "Login Successful!" : "Registration Successful!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Failed, please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
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
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="renter">Renter</option>
            <option value="owner">Owner</option>
          </select>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">{isLogin ? "Login" : "Register"}</button>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

        <div className="google-btn">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
        </div>
      </form>
    </div>
  );
}

export default AuthForm;
