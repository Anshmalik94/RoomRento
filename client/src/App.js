import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AuthForm from "./components/AuthForm";
import HelpSupport from "./components/HelpSupport";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/add-room">Add Room</Link>
            <button onClick={() => setToken("")}>Logout</button>
          </>
        ) : (
          <Link to="/auth">Login/Register</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<RoomsList />} />
        <Route path="/room/:id" element={<RoomDetails />} />
        <Route path="/add-room" element={<AddRoom token={token} />} />
        <Route path="/auth" element={<AuthForm setToken={setToken} />} />
        <Route path="/help" element={<HelpSupport />} />
      </Routes>
    </Router>
  );
}

export default App;
