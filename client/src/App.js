import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomsList from "./components/RoomsList";
import RoomDetails from "./components/RoomDetails";
import AddRoom from "./components/AddRoom";
import AuthForm from "./components/AuthForm";
import HelpSupport from "./components/HelpSupport";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <Router>
      <Navbar token={token} setToken={setToken} />

      <Routes>
        <Route path="/" element={<RoomsList />} />
        <Route path="/room/:id" element={<RoomDetails />} />
        <Route path="/add-room" element={<AddRoom token={token} />} />
        <Route path="/login" element={<AuthForm setToken={setToken} />} />
        <Route path="/help" element={<HelpSupport />} />
      </Routes>
    </Router>
  );
}

export default App;
