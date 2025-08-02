import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import BASE_URL from "../config";
import "./Shop.css";

function Shop() {
  const [originalShops, setOriginalShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedShops, setSavedShops] = useState(new Set());
  const location = useLocation();
  
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Load saved shops from localStorage and listen for changes
  useEffect(() => {
    const updateSavedState = () => {
      if (token && currentUserId) {
        const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        setSavedShops(new Set(savedProperties));
      }
    };

    updateSavedState();

    // Listen for custom events from other components only
    const handleCustomSaveEvent = (event) => {
      if (event.detail && event.detail.propertyId) {
        updateSavedState(); // Refresh entire saved state for shops
      }
    };
    
    window.addEventListener('savedPropertiesChanged', handleCustomSaveEvent);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleCustomSaveEvent);
    };
  }, [token, currentUserId]);

  const handleSaveToggle = (e, shopId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      alert('Please login to save properties');
      return;
    }
    
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    let updatedSaved;
    let newSavedState;
    
    if (savedShops.has(shopId)) {
      // Remove from saved (unsave) - Heart becomes unfilled
      updatedSaved = savedProperties.filter(id => id !== shopId);
      newSavedState = false;
      setSavedShops(prev => {
        const newSet = new Set(prev);
        newSet.delete(shopId);
        return newSet;
      });
    } else {
      // Add to saved - Heart becomes filled
      if (!savedProperties.includes(shopId)) {
        updatedSaved = [...savedProperties, shopId];
        newSavedState = true;
        setSavedShops(prev => new Set(prev).add(shopId));
      } else {
        return;
      }
    }
    
    // Remove duplicates and update localStorage
    updatedSaved = [...new Set(updatedSaved)];
    localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
      detail: { propertyId: shopId, isSaved: newSavedState }
    }));
  };

  const fetchShopItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get(`${BASE_URL}/api/shops`);
      // Check if response has shops array (paginated) or is direct array
      const fetchedShops = res.data.shops || res.data;
      setOriginalShops(fetchedShops);
      
      // Apply filters if this is a filtered search
      const queryParams = new URLSearchParams(location.search);
      const isFiltered = queryParams.get("filtered") === "true";
      
      let filteredData = [...fetchedShops];
      
      if (isFiltered) {
        // Get filter parameters from URL
        const urlFilters = {
          location: queryParams.get("location") || '',
          budget: queryParams.get("budget") || '',
          category: queryParams.get("category") || ''
        };
        
        // Check if any actual filters are provided
        const hasActualFilters = (
          (urlFilters.location && urlFilters.location.trim() !== '') ||
          (urlFilters.budget && urlFilters.budget.trim() !== '') ||
          (urlFilters.category && urlFilters.category.trim() !== '')
        );

        // If this is a filtered search but no actual filters, show empty results
        if (!hasActualFilters) {
          filteredData = [];
        } else {
          // Apply location filter (AND logic) - Strict matching
          if (urlFilters.location && urlFilters.location.trim() !== '') {
            filteredData = filteredData.filter((shop) => {
              if (!shop.location) return false;
              
              const shopLocation = (shop.location || '').toLowerCase().trim();
              const filterLocation = urlFilters.location.toLowerCase().trim();
              
              return shopLocation === filterLocation || 
                     shopLocation.includes(filterLocation);
            });
          }

          // Apply budget filter (AND logic) - Range based
          if (urlFilters.budget && urlFilters.budget.trim() !== '') {
            filteredData = filteredData.filter((shop) => {
              const shopPrice = parseInt(shop.price, 10);
              if (isNaN(shopPrice)) return false;
              
              const budgetRange = urlFilters.budget;
              if (budgetRange === '0-2000') {
                return shopPrice >= 0 && shopPrice <= 2000;
              } else if (budgetRange === '2000-5000') {
                return shopPrice > 2000 && shopPrice <= 5000;
              } else if (budgetRange === '5000-8000') {
                return shopPrice > 5000 && shopPrice <= 8000;
              } else if (budgetRange === '8000-12000') {
                return shopPrice > 8000 && shopPrice <= 12000;
              } else if (budgetRange === '12000-20000') {
                return shopPrice > 12000 && shopPrice <= 20000;
              } else if (budgetRange === '20000-50000') {
                return shopPrice > 20000 && shopPrice <= 50000;
              } else if (budgetRange === '50000+') {
                return shopPrice > 50000;
              }
              return false;
            });
          }

          // Apply category filter (AND logic)
          if (urlFilters.category && urlFilters.category.trim() !== '') {
            filteredData = filteredData.filter((shop) => {
              const shopCategory = (shop.category || '').toLowerCase();
              const filterCategory = urlFilters.category.toLowerCase();
              return shopCategory.includes(filterCategory) || shopCategory === filterCategory;
            });
          }
        }
      }
      
      setFilteredShops(filteredData);
    } catch (err) {
      console.error("Error fetching shop items:", err);
      setError("Failed to load shop items");
      setOriginalShops([]);
      setFilteredShops([]);
    } finally {
      setLoading(false);
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  if (loading) {
    return <LoadingSpinner isLoading={loading} message="Loading shop spaces..." />;
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle" style={{fontSize: '4rem', color: '#dc3545', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#dc3545'}}>Error Loading Shops</h3>
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
        <i className="bi bi-shop" style={{color: '#6f42c1'}}></i>
        <h2 className="mb-0" style={{color: '#6f42c1'}}>
          {isFiltered ? 'Filtered Commercial Spaces' : 'Commercial Spaces'}
        </h2>
        {isFiltered && (
          <p className="text-muted mt-2">
            Showing {filteredShops.length} result(s) based on your filters
          </p>
        )}
      </div>
      <p className="lead text-muted mb-4">
        Find the perfect commercial space for your business
      </p>

      {filteredShops.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-shop-window" style={{fontSize: '4rem', color: '#6f42c1', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#6f42c1'}}>
            {isFiltered ? 'No results found' : 'No Commercial Spaces Available'}
          </h3>
          <p className="text-muted mb-4 lead">
            {isFiltered 
              ? 'No commercial spaces match your filters. Please try different filters.'
              : 'Currently, there are no commercial spaces listed on our platform.'
            }
          </p>
          {isFiltered ? (
            <button 
              className="btn btn-outline-primary me-3"
              onClick={() => window.location.href = '/shop'}
            >
              <i className="bi bi-arrow-left me-2"></i>
              View All Shops
            </button>
          ) : (
            localStorage.getItem("role") === "owner" && (
              <div className="bg-light p-4 rounded-4 d-inline-block">
                <p className="mb-3">
                  <strong>Do you have a commercial space to rent?</strong><br/>
                  List your shop and connect with potential tenants!
                </p>
                <button 
                  className="btn btn-lg px-4"
                  style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      window.location.href = '/add-shop';
                    }, 100);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  List Your Shop
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="row">
          {filteredShops.map((shop) => (
            <div className="col-lg-4 col-md-6 mb-4" key={shop._id}>
              <div className="card h-100 room-card-modern"
                   onClick={() => {
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                     setTimeout(() => {
                       window.location.href = `/room/${shop._id}`;
                     }, 100);
                   }}>
                <div className="room-card-image-container">
                  <img
                    className="room-card-image"
                    src={shop.images && shop.images[0] ? shop.images[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
                    alt={shop.title}
                    loading="lazy"
                  />
                  
                  {/* Property Type Badge */}
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge px-3 py-2 rounded-pill" 
                          style={{ backgroundColor: 'rgba(255, 152, 0, 0.9)', color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
                      <i className="bi bi-shop me-1"></i>
                      Commercial
                    </span>
                  </div>

                  {/* Save Heart Icon - Top Right */}
                  {currentUserId !== shop.user?._id && (
                    <button
                      className="position-absolute"
                      style={{
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: 10,
                        backdropFilter: 'blur(10px)'
                      }}
                      onClick={(e) => handleSaveToggle(e, shop._id)}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                    >
                      <i 
                        className={`bi ${savedShops.has(shop._id) ? 'bi-heart-fill' : 'bi-heart'}`}
                        style={{ 
                          color: savedShops.has(shop._id) ? '#ff6b6b' : '#ff9800',
                          fontSize: '18px',
                          transition: 'all 0.3s ease'
                        }}
                      ></i>
                    </button>
                  )}

                  {/* Price Badge */}
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <div className="px-3 py-2 rounded-pill d-flex align-items-center"
                         style={{ 
                           background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.9), rgba(255, 193, 7, 0.9))',
                           backdropFilter: 'blur(10px)',
                           border: '1px solid rgba(255, 255, 255, 0.2)',
                           boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                         }}>
                      <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                        ₹{shop.price ? shop.price.toLocaleString() : 'N/A'}
                      </span>
                      <small className="text-white ms-1" style={{ opacity: 0.9 }}>/month</small>
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="position-absolute bottom-0 start-0 end-0" 
                       style={{
                         height: '100px',
                         background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                         pointerEvents: 'none'
                       }}>
                  </div>
                </div>
                
                <div className="room-card-content">
                  <div className="room-card-header">
                    <h5 className="room-card-title">{shop.title}</h5>
                    <div className="room-card-location">
                      <i className="bi bi-geo-alt me-2"></i>
                      {shop.location}
                    </div>
                  </div>
                  
                  <p className="room-card-description">
                    {shop.description ? 
                      shop.description.substring(0, 85) + "..." : 
                      "Commercial space available for rent"
                    }
                  </p>
                  
                  <div className="room-card-details">
                    <div className="detail-item">
                      <i className="bi bi-building detail-icon" style={{ color: '#ff9800' }}></i>
                      <span>{shop.roomType || 'Commercial'}</span>
                    </div>
                    {shop.furnished && (
                      <div className="detail-item">
                        <i className="bi bi-tools detail-icon" style={{ color: '#ff9800' }}></i>
                        <span>{shop.furnished}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <i className="bi bi-shop detail-icon" style={{ color: '#ff9800' }}></i>
                      <span>Commercial Space</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;
