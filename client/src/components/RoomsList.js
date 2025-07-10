import { useEffect, useState } from "react";
import axios from "axios";
import RoomCard from "./RoomCard";
import BASE_URL from "../config";
import "./RoomsList.css";


function RoomsList({ filters }) {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

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

    if (filters.location)
      result = result.filter(r => r.location && r.location.toLowerCase().includes(filters.location.toLowerCase()));

    if (filters.roomType)
      result = result.filter(r => r.roomType === filters.roomType);

    if (filters.budget) {
      const maxBudget = parseInt(filters.budget, 10);
      result = result.filter(r => !isNaN(maxBudget) ? Number(r.price) <= maxBudget : true);
    }

    if (filters.roomCategory) {
      // roomCategory can be: Furnished, Semi-Furnished, Unfurnished, PgType, GirlsPg, BoysPg
      if (["Furnished", "Semi-Furnished", "Unfurnished"].includes(filters.roomCategory)) {
        result = result.filter(r => r.furnished === filters.roomCategory);
      } else if (filters.roomCategory === "PgType") {
        result = result.filter(r => r.roomType && r.roomType.toLowerCase().includes("pg"));
      } else if (filters.roomCategory === "GirlsPg") {
        result = result.filter(r => r.roomType && r.roomType.toLowerCase().includes("girls"));
      } else if (filters.roomCategory === "BoysPg") {
        result = result.filter(r => r.roomType && r.roomType.toLowerCase().includes("boys"));
      }
    }

    setFilteredRooms(result);
  }, [filters, rooms]);



  return (
    <div className="rooms-container">
      <h2 className="rooms-heading">Available Rooms</h2>

      {/* Filter section removed as per user request */}

      <div className="room-list">
        {filteredRooms.map(room => (
          <RoomCard key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
}

export default RoomsList;
