import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import RoomCard from "./RoomCard";
import LoadingSpinner from "./LoadingSpinner";
import BASE_URL from "../config";
import "./RoomsList.css";

function RoomsList({ filters = {} }) {
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
    const city = queryParams.get("city");
    const lat = queryParams.get("lat");
    const lng = queryParams.get("lng");
    const nearby = queryParams.get("nearby");
    const isFiltered = queryParams.get("filtered") === "true";
    
    // Get all filter parameters from URL
    const urlFilters = {
      propertyType: queryParams.get("propertyType") || 'Room',
      location: queryParams.get("location") || '',
      roomType: queryParams.get("roomType") || '',
      budget: queryParams.get("budget") || '',
      roomCategory: queryParams.get("roomCategory") || '',
      nearby: nearby === 'true'
    };

    let apiUrl = `${BASE_URL}/api/rooms`;

    if (city) {
      apiUrl += `?city=${city}&type=Room`;
    } else if (lat && lng && nearby) {
      apiUrl += `?lat=${lat}&lng=${lng}&nearby=true&type=Room`;
    } else {
      apiUrl += `?type=Room`;
    }

    axios
      .get(apiUrl)
      .then((res) => {
        setRooms(res.data);
        
        // Apply URL filters with AND logic if this is a filtered search
        let filteredData = [...res.data];
        
        if (isFiltered) {
          // Check if any actual filters are provided
          const hasActualFilters = (
            (urlFilters.location && urlFilters.location.trim() !== '') ||
            (urlFilters.roomType && urlFilters.roomType.trim() !== '') ||
            (urlFilters.budget && urlFilters.budget.trim() !== '') ||
            (urlFilters.roomCategory && urlFilters.roomCategory.trim() !== '')
          );

          // If this is a filtered search but no actual filters, show empty results
          if (!hasActualFilters) {
            filteredData = [];
          } else {
            // Apply location filter (AND logic) - Strict matching
            if (urlFilters.location && urlFilters.location.trim() !== '') {
              filteredData = filteredData.filter((room) => {
                if (!room.location) return false;
                
                const roomLocation = (room.location || '').toLowerCase().trim();
                const filterLocation = urlFilters.location.toLowerCase().trim();
                
                // Exact match or location contains the filter
                return roomLocation === filterLocation || 
                       roomLocation.includes(filterLocation);
              });
            }

            // Apply room type filter (AND logic)
            if (urlFilters.roomType && urlFilters.roomType.trim() !== '') {
              filteredData = filteredData.filter((room) => {
                if (!room.roomType) return false;
                return room.roomType.toLowerCase() === urlFilters.roomType.toLowerCase();
              });
            }

            // Apply budget filter (AND logic) - Range based
            if (urlFilters.budget && urlFilters.budget.trim() !== '') {
              filteredData = filteredData.filter((room) => {
                const roomPrice = parseInt(room.price, 10);
                if (isNaN(roomPrice)) return false;
                
                const budgetRange = urlFilters.budget;
                if (budgetRange === '0-2000') {
                  return roomPrice >= 0 && roomPrice <= 2000;
                } else if (budgetRange === '2000-5000') {
                  return roomPrice > 2000 && roomPrice <= 5000;
                } else if (budgetRange === '5000-8000') {
                  return roomPrice > 5000 && roomPrice <= 8000;
                } else if (budgetRange === '8000-12000') {
                  return roomPrice > 8000 && roomPrice <= 12000;
                } else if (budgetRange === '12000-20000') {
                  return roomPrice > 12000 && roomPrice <= 20000;
                } else if (budgetRange === '20000-50000') {
                  return roomPrice > 20000 && roomPrice <= 50000;
                } else if (budgetRange === '50000+') {
                  return roomPrice > 50000;
                }
                return false;
              });
            }

            // Apply room category filter (AND logic) - now includes room type options
            if (urlFilters.roomCategory && urlFilters.roomCategory.trim() !== '') {
              filteredData = filteredData.filter((room) => {
                const category = urlFilters.roomCategory;
                
                // Handle room type options (Single, Double, Separate, Shared)
                if (["Single", "Double", "Separate", "Shared"].includes(category)) {
                  return room.roomType && room.roomType.toLowerCase().includes(category.toLowerCase());
                }
                
                // Handle furniture categories
                if (["Furnished", "Semi-Furnished", "Unfurnished"].includes(category)) {
                  return room.furnished && room.furnished.toLowerCase().includes(category.toLowerCase());
                }
                
                // Handle PG categories
                if (category === "PgType") {
                  return room.roomType && room.roomType.toLowerCase().includes("pg");
                } else if (category === "GirlsPg") {
                  return room.roomType && (
                    room.roomType.toLowerCase().includes("girls") ||
                    room.roomType.toLowerCase().includes("girls pg") ||
                    room.roomType.toLowerCase().includes("pg for girls")
                  );
                } else if (category === "BoysPg") {
                  return room.roomType && (
                    room.roomType.toLowerCase().includes("boys") ||
                    room.roomType.toLowerCase().includes("boys pg") ||
                    room.roomType.toLowerCase().includes("pg for boys")
                  );
                }
                
                return false;
              });
            }
          }
        }
        
        setFilteredRooms(filteredData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setError("Unable to fetch rooms at the moment. Please try again later.");
        setLoading(false);
      });
  }, [location.search]);

  useEffect(() => {
    let result = [...rooms]; // Create a copy to avoid mutation

    // Apply filters with proper logic - if any filter is applied, only show matching results
    const hasFilters = Object.values(filters).some(value => 
      value !== '' && value !== null && value !== undefined && value !== false
    );

    // Always apply filters if they exist - don't show all rooms when no match
    if (hasFilters) {
      // Apply location filter - Strict matching
      if (filters.location && filters.location.trim() !== '') {
        result = result.filter((room) => {
          if (!room.location && !room.city) return false;
          
          const roomLocation = (room.location || '').toLowerCase().trim();
          const roomCity = (room.city || '').toLowerCase().trim();
          const filterLocation = filters.location.toLowerCase().trim();
          
          // Exact match or city name contains the filter (but stricter)
          return roomLocation === filterLocation || 
                 roomCity === filterLocation ||
                 roomLocation.includes(filterLocation) ||
                 roomCity.includes(filterLocation);
        });
      }

      // Apply room type filter
      if (filters.roomType && filters.roomType.trim() !== '') {
        result = result.filter((room) => {
          if (!room.roomType) return false;
          return room.roomType.toLowerCase() === filters.roomType.toLowerCase();
        });
      }

      // Apply budget filter - Range based
      if (filters.budget && filters.budget.trim() !== '') {
        result = result.filter((room) => {
          const roomPrice = parseInt(room.price, 10);
          if (isNaN(roomPrice)) return false;
          
          const budgetRange = filters.budget;
          if (budgetRange === '0-2000') {
            return roomPrice >= 0 && roomPrice <= 2000;
          } else if (budgetRange === '2000-5000') {
            return roomPrice > 2000 && roomPrice <= 5000;
          } else if (budgetRange === '5000-8000') {
            return roomPrice > 5000 && roomPrice <= 8000;
          } else if (budgetRange === '8000-12000') {
            return roomPrice > 8000 && roomPrice <= 12000;
          } else if (budgetRange === '12000-20000') {
            return roomPrice > 12000 && roomPrice <= 20000;
          } else if (budgetRange === '20000-50000') {
            return roomPrice > 20000 && roomPrice <= 50000;
          } else if (budgetRange === '50000+') {
            return roomPrice > 50000;
          }
          return false;
        });
      }

      // Apply room category filter (now includes room type options)
      if (filters.roomCategory && filters.roomCategory.trim() !== '') {
        result = result.filter((room) => {
          const category = filters.roomCategory;
          
          // Handle room type options (Single, Double, Separate, Shared)
          if (["Single", "Double", "Separate", "Shared"].includes(category)) {
            return room.roomType && room.roomType.toLowerCase().includes(category.toLowerCase());
          }
          
          // Handle furniture categories
          if (["Furnished", "Semi-Furnished", "Unfurnished"].includes(category)) {
            return room.furnished && room.furnished.toLowerCase().includes(category.toLowerCase());
          }
          
          // Handle PG categories
          if (category === "PgType") {
            return room.roomType && room.roomType.toLowerCase().includes("pg");
          } else if (category === "GirlsPg") {
            return room.roomType && (
              room.roomType.toLowerCase().includes("girls") ||
              room.roomType.toLowerCase().includes("girls pg") ||
              room.roomType.toLowerCase().includes("pg for girls")
            );
          } else if (category === "BoysPg") {
            return room.roomType && (
              room.roomType.toLowerCase().includes("boys") ||
              room.roomType.toLowerCase().includes("boys pg") ||
              room.roomType.toLowerCase().includes("pg for boys")
            );
          }
          
          return false;
        });
      }
    }

    // Update filtered rooms - if no filters, show all; if filters but no match, show empty
    setFilteredRooms(result);

    // Auto-scroll to results section
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [filters, rooms]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };

  const displayedRooms = filteredRooms.slice(0, displayCount);
  const hasMoreRooms = filteredRooms.length > displayCount;

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading rooms..." />;
  }

  if (error) {
    return (
      <Container className="my-4 my-md-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <div
              className="alert alert-danger text-center border-0 card-responsive"
              role="alert"
            >
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
    <section id="results-section" className="rooms-list-section py-responsive">
      <Container className="responsive-container">
        {/* Header */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div>
                <h2 className="responsive-title fw-bold text-dark mb-1">Available Rooms</h2>
                <p className="text-muted mb-0">
                  {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found
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
            displayedRooms.map((room) => (
              <RoomCard room={room} key={room._id} />
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5">
                <div className="mb-4">
                  <i
                    className="bi bi-house-x"
                    style={{ fontSize: "3rem", color: "#6f42c1", opacity: "0.6" }}
                  ></i>
                </div>
                <h3
                  className="responsive-title fw-bold mb-3"
                  style={{ color: "#6f42c1" }}
                >
                  No results found for selected filters
                </h3>
                <p className="text-muted mb-4">
                  Try adjusting your filters to find matching rooms.
                </p>
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
                style={{
                  background: "rgba(111, 66, 193, 0.1)",
                  color: "#6f42c1",
                  border: "2px solid #6f42c1",
                }}
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
