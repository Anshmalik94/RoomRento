import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import RoomCard from "./RoomCard";
import Spinner, { CardSkeleton } from "./Spinner";
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
        // Error loading rooms
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
      <Container className="my-4 my-md-5">
        <Row className="justify-content-center">
          <Col xs={12} className="text-center">
            <Spinner text="Loading rooms..." />
          </Col>
        </Row>
        <Row className="mt-4">
          <CardSkeleton count={6} />
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4 my-md-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <div className="alert alert-danger text-center border-0 card-responsive" role="alert">
              <i className="bi bi-exclamation-triangle display-6 text-danger mb-3"></i>
              <h4 className="alert-heading">Oops! Something went wrong</h4>
              <p className="mb-0">{error}</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <section className="rooms-list-section py-responsive">
      <Container className="responsive-container">
        {/* Header */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div>
                <h2 className="responsive-title fw-bold text-dark mb-1">Available Rooms</h2>
                <p className="text-muted mb-0">
                  {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {/* Sort options */}
              <div className="d-none d-md-block">
                <small className="text-muted">
                  <i className="bi bi-sort-down me-1"></i>
                  Sorted by popularity
                </small>
              </div>
            </div>
          </Col>
        </Row>

        {/* Rooms Grid */}
        <Row className="g-3 g-md-4 row-responsive">
          {displayedRooms.length > 0 ? (
            displayedRooms.map(room => (
              <Col xs={12} sm={6} lg={4} xl={3} key={room._id} className="d-flex">
                <RoomCard room={room} />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-house-x" style={{fontSize: '3rem', color: '#6f42c1', opacity: '0.6'}}></i>
                </div>
                <h3 className="responsive-title fw-bold mb-3" style={{color: '#6f42c1'}}>No Rooms Available</h3>
                <p className="text-muted mb-4">
                  Currently, there are no rooms matching your criteria.
                </p>
                {localStorage.getItem("role") === "owner" && (
                  <div className="bg-light p-3 p-md-4 rounded-4 d-inline-block">
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
                <div className="mt-4 d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <Button 
                    variant="outline-primary" 
                    className="btn-responsive"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className="btn-responsive"
                    onClick={() => window.history.back()}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </Button>
                </div>
              </div>
            </Col>
          )}
        </Row>

        {/* Load More Button */}
        {hasMoreRooms && (
          <Row className="mt-4 mt-md-5">
            <Col xs={12} className="text-center">
              <Button 
                size="lg"
                className="btn-responsive px-4 px-md-5 border-0"
                style={{background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1', border: '2px solid #6f42c1'}}
                onClick={handleLoadMore}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Load More Rooms
              </Button>
            </Col>
          </Row>
        )}

        {/* Results Summary */}
        {filteredRooms.length > 0 && (
          <Row className="mt-3 mt-md-4">
            <Col xs={12} className="text-center">
              <small className="text-muted">
                Showing {Math.min(displayCount, filteredRooms.length)} of {filteredRooms.length} rooms
              </small>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
}

export default RoomsList;
