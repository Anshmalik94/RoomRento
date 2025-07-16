import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import RoomCard from "./RoomCard";
import BASE_URL from "../config";
import "./RoomsList.css";

function RoomsList({ filters }) {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(12); // Show 12 cards initially
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get('city');
    const lat = queryParams.get('lat');
    const lng = queryParams.get('lng');
    const nearby = queryParams.get('nearby');

    let apiUrl = `${BASE_URL}/api/rooms`;
    
    // Now filter by type since all rooms have type field after migration
    if (city) {
      apiUrl += `?city=${city}&type=Room`;
    } else if (lat && lng && nearby) {
      apiUrl += `?lat=${lat}&lng=${lng}&nearby=true&type=Room`;
    } else {
      apiUrl += `?type=Room`;
    }

    axios.get(apiUrl)
      .then(res => {
        setRooms(res.data);
        setFilteredRooms(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError('Failed to load rooms. Please try again.');
        setLoading(false);
      });
  }, [location.search]);

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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  const displayedRooms = filteredRooms.slice(0, displayCount);
  const hasMoreRooms = filteredRooms.length > displayCount;

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" style={{color: '#6f42c1'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="rooms-list-section">
      <div className="container my-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1 fw-bold text-dark">Available Rooms</h2>
            <p className="text-muted mb-0">
              {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Sort options could go here */}
          <div className="d-none d-md-block">
            <small className="text-muted">
              <i className="bi bi-sort-down me-1"></i>
              Sorted by popularity
            </small>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="row g-4">
          {displayedRooms.length > 0 ? (
            displayedRooms.map(room => (
              <RoomCard key={room._id} room={room} />
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-house-x" style={{fontSize: '4rem', color: '#6f42c1', opacity: '0.6'}}></i>
                </div>
                <h3 className="fw-bold mb-3" style={{color: '#6f42c1'}}>No Rooms Available</h3>
                <p className="text-muted mb-4 lead">
                  Currently, there are no rooms matching your criteria.
                </p>
                {localStorage.getItem("role") === "owner" && (
                  <div className="bg-light p-4 rounded-4 d-inline-block">
                    <p className="mb-3">
                      <strong>Do you have a room to rent?</strong><br/>
                      List your room and start earning today!
                    </p>
                    <button 
                      className="btn btn-primary btn-lg px-4"
                      onClick={() => window.location.href = '/add-room'}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      List Your Room
                    </button>
                  </div>
                )}
                <div className="mt-4">
                  <button 
                    className="btn btn-outline-primary px-4 me-3"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                  <button 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      window.history.back();
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMoreRooms && (
          <div className="text-center mt-5">
            <button 
              className="btn btn-lg px-5 border-0"
              style={{background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1', border: '2px solid #6f42c1'}}
              onClick={handleLoadMore}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Load More Rooms
            </button>
          </div>
        )}

        {/* Results Summary */}
        {filteredRooms.length > 0 && (
          <div className="text-center mt-4">
            <small className="text-muted">
              Showing {Math.min(displayCount, filteredRooms.length)} of {filteredRooms.length} rooms
            </small>
          </div>
        )}
      </div>
    </section>
  );
}

export default RoomsList;
