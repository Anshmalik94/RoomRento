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
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-home">RoomRento</Link>
      </div>

      <div className="navbar-center">
        {/* Future logo space */}
      </div>

      <div className="navbar-right">
        <Link to="/help" className="navbar-btn">Help & Support</Link>

        {token && role === "owner" && (
          <Link to="/add-room" className="navbar-btn">Add Room</Link>
        )}

        {token ? (
          <button className="navbar-btn logout-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="navbar-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
