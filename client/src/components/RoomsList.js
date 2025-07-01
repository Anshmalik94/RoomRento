import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../config";
import "./RoomsList.css";

function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    roomType: "",
    furnished: "",
  });

  useEffect(() => {
    axios.get(`${BASE_URL}/rooms`)
      .then(res => {
        setRooms(res.data);
        setFilteredRooms(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    let result = rooms;

    if (search)
      result = result.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

    if (filters.location)
      result = result.filter(r => r.location.toLowerCase().includes(filters.location.toLowerCase()));

    if (filters.roomType)
      result = result.filter(r => r.roomType === filters.roomType);

    if (filters.furnished)
      result = result.filter(r => r.furnished === filters.furnished);

    setFilteredRooms(result);
  }, [search, filters, rooms]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="rooms-container">
      <h2 className="rooms-heading">Available Rooms</h2>

      <div className="filter-container">
        <input
          className="filter-input"
          placeholder="Search by Title"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <input
          className="filter-input"
          placeholder="Filter by Location"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        />

        <select
          className="filter-select"
          name="roomType"
          value={filters.roomType}
          onChange={handleFilterChange}
        >
          <option value="">Room Type</option>
          <option value="Single">Single</option>
          <option value="Shared">Shared</option>
          <option value="Double">Double</option>
          <option value="Normal">Normal</option>
          <option value="Separate">Separate</option>
        </select>

        <select
          className="filter-select"
          name="furnished"
          value={filters.furnished}
          onChange={handleFilterChange}
        >
          <option value="">Furnished?</option>
          <option value="Furnished">Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>

      <div className="room-list">
        {filteredRooms.map(room => (
          <div key={room._id} className="room-card">
            <Link to={`/room/${room._id}`}>
              <img src={room.images[0]} alt="room" />
              <h3>{room.title}</h3>
              <p>₹{room.price} | {room.location}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomsList;
