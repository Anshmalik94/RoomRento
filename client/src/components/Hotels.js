import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import HotelCard from "./HotelCard";
import LoadingSpinner from "./LoadingSpinner";
import "./RoomsList.css";

function Hotels() {
  const [hotelsData, setHotelsData] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchHotels();
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_URL}/api/hotels`);
      // Check if response has hotels array (paginated) or is direct array
      const fetchedHotels = res.data.hotels || res.data;
      setHotelsData(fetchedHotels);
      
      // Apply filters if this is a filtered search
      const queryParams = new URLSearchParams(location.search);
      const isFiltered = queryParams.get("filtered") === "true";
      
      let filteredData = [...fetchedHotels];
      
      if (isFiltered) {
        // Get filter parameters from URL
        const urlFilters = {
          location: queryParams.get("location") || '',
          budget: queryParams.get("budget") || '',
          roomCategory: queryParams.get("roomCategory") || ''
        };
        
        // Check if any actual filters are provided
        const hasActualFilters = (
          (urlFilters.location && urlFilters.location.trim() !== '') ||
          (urlFilters.budget && urlFilters.budget.trim() !== '') ||
          (urlFilters.roomCategory && urlFilters.roomCategory.trim() !== '')
        );

        // If this is a filtered search but no actual filters, show empty results
        if (!hasActualFilters) {
          filteredData = [];
        } else {
          // Apply location filter (AND logic) - Strict matching
          if (urlFilters.location && urlFilters.location.trim() !== '') {
            filteredData = filteredData.filter((hotel) => {
              if (!hotel.location) return false;
              
              const hotelLocation = (hotel.location || '').toLowerCase().trim();
              const filterLocation = urlFilters.location.toLowerCase().trim();
              
              // Exact match or contains match for location
              return hotelLocation === filterLocation || 
                     hotelLocation.includes(filterLocation);
            });
          }

          // Apply budget filter (AND logic) - Range based
          if (urlFilters.budget && urlFilters.budget.trim() !== '') {
            filteredData = filteredData.filter((hotel) => {
              const hotelPrice = parseInt(hotel.price, 10);
              if (isNaN(hotelPrice)) return false;
              
              const budgetRange = urlFilters.budget;
              if (budgetRange === '0-2000') {
                return hotelPrice >= 0 && hotelPrice <= 2000;
              } else if (budgetRange === '2000-5000') {
                return hotelPrice > 2000 && hotelPrice <= 5000;
              } else if (budgetRange === '5000-8000') {
                return hotelPrice > 5000 && hotelPrice <= 8000;
              } else if (budgetRange === '8000-12000') {
                return hotelPrice > 8000 && hotelPrice <= 12000;
              } else if (budgetRange === '12000-20000') {
                return hotelPrice > 12000 && hotelPrice <= 20000;
              } else if (budgetRange === '20000-50000') {
                return hotelPrice > 20000 && hotelPrice <= 50000;
              } else if (budgetRange === '50000+') {
                return hotelPrice > 50000;
              }
              return false;
            });
          }
        }
      }
      
      setFilteredHotels(filteredData);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Unable to fetch hotels at the moment. Please try again later.");
      setFilteredHotels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading hotels..." />;
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle" style={{fontSize: '4rem', color: '#dc3545', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#dc3545'}}>Error Loading Hotels</h3>
          <p className="text-muted mb-4 lead">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a filtered search to show appropriate messages
  const queryParams = new URLSearchParams(location.search);
  const isFiltered = queryParams.get("filtered") === "true";

  return (
    <div className="container mt-5 pt-5">
      <div className="section-header mb-4">
        <i className="bi bi-building" style={{color: '#6f42c1'}}></i>
        <h2 className="mb-0" style={{color: '#6f42c1'}}>
          {isFiltered ? 'Filtered Hotels' : 'Available Hotels'}
        </h2>
        {isFiltered && (
          <p className="text-muted mt-2">
            Showing {filteredHotels.length} result(s) based on your filters
          </p>
        )}
      </div>
      {filteredHotels.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-building-x" style={{fontSize: '4rem', color: '#6f42c1', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#6f42c1'}}>
            {isFiltered ? 'No results found' : 'No Hotels Available'}
          </h3>
          <p className="text-muted mb-4 lead">
            {isFiltered 
              ? 'No hotels match your filters. Please try different filters.'
              : 'Currently, there are no hotels listed on our platform.'
            }
          </p>
          {isFiltered ? (
            <button 
              className="btn btn-outline-primary me-3"
              onClick={() => window.location.href = '/hotels'}
            >
              <i className="bi bi-arrow-left me-2"></i>
              View All Hotels
            </button>
          ) : (
            localStorage.getItem("role") === "owner" && (
              <div className="bg-light p-4 rounded-4 d-inline-block">
                <p className="mb-3">
                  <strong>Are you a hotel owner?</strong><br/>
                  List your hotel and start welcoming guests today!
                </p>
                <button 
                  className="btn btn-lg px-4"
                  style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                  onClick={() => {
                    // Check if user is logged in before allowing hotel listing
                    const token = localStorage.getItem("token");
                    if (!token) {
                      alert('Please login to list your hotel');
                      return;
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      window.location.href = '/add-hotel';
                    }, 100);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  List Your Hotel
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredHotels.map((hotel) => (
            <div className="col-lg-4 col-md-6 col-12" key={hotel._id}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hotels;
