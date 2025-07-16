import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "./Shop.css";

function Shop() {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageColors, setImageColors] = useState({});

  // Function to detect if image is light or dark
  const getImageBrightness = (imageSrc, shopId) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      
      try {
        ctx.drawImage(this, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let colorSum = 0;
        let pixelCount = 0;
        
        // Sample pixels to calculate average brightness
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance using standard formula
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          colorSum += luminance;
          pixelCount++;
        }
        
        const avgBrightness = colorSum / pixelCount;
        const isLight = avgBrightness > 128; // Threshold for light/dark
        
        setImageColors(prev => ({
          ...prev,
          [shopId]: isLight ? 'dark' : 'light' // dark text on light bg, light text on dark bg
        }));
      } catch (error) {
        // Fallback to light text if image analysis fails
        setImageColors(prev => ({
          ...prev,
          [shopId]: 'light'
        }));
      }
    };
    
    img.onerror = function() {
      // Fallback to light text if image fails to load
      setImageColors(prev => ({
        ...prev,
        [shopId]: 'light'
      }));
    };
    
    img.src = imageSrc;
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/shops`);
      // Check if response has shops array (paginated) or is direct array
      const shopsData = res.data.shops || res.data;
      setShopItems(shopsData);
      setError(''); // Clear any previous errors
      
      // Analyze image brightness for each shop
      shopsData.forEach(shop => {
        if (shop.images && shop.images.length > 0) {
          getImageBrightness(shop.images[0], shop._id);
        }
      });
    } catch (err) {
      console.error("Error fetching shop items:", err);
      setError("Failed to load shop items");
      // Set empty array if API fails
      setShopItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center">
          <div className="spinner-border" style={{color: '#6f42c1'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{color: 'rgba(0, 0, 0, 0.8)'}}>Loading shop spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="section-header mb-4">
        <i className="bi bi-shop" style={{color: '#6f42c1'}}></i>
        <h2 className="mb-0" style={{color: '#6f42c1'}}>Commercial Spaces</h2>
      </div>
      <p className="lead text-muted mb-4">
        Find the perfect commercial space for your business
      </p>

      {error && (
        <div className="alert alert-warning border-0" style={{backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#000'}}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {shopItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-shop-window" style={{fontSize: '4rem', color: '#6f42c1', opacity: '0.6'}}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{color: '#6f42c1'}}>No Commercial Spaces Available</h3>
          <p className="text-muted mb-4 lead">
            Currently, there are no commercial spaces listed on our platform.
          </p>
          {localStorage.getItem("role") === "owner" && (
            <div className="bg-light p-4 rounded-4 d-inline-block">
              <p className="mb-3">
                <strong>Do you have a commercial space to rent?</strong><br/>
                List your shop and connect with potential tenants!
              </p>
              <button 
                className="btn btn-lg px-4"
                style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                onClick={() => window.location.href = '/add-shop'}
              >
                <i className="bi bi-plus-circle me-2"></i>
                List Your Shop
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row">
          {shopItems.map((shop) => (
            <div className="col-lg-4 col-md-6 mb-4" key={shop._id}>
              <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden position-relative"
                   style={{ cursor: 'pointer', transition: 'none' }}
                   onClick={() => window.location.href = `/room/${shop._id}`}>
                <div className="position-relative overflow-hidden">
                  <img
                    className="card-img-top"
                    src={shop.images && shop.images[0] ? shop.images[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
                    alt={shop.title}
                    style={{ height: "240px", objectFit: "cover", transition: 'none' }}
                    onLoad={() => {
                      // Re-analyze image when it loads
                      if (!imageColors[shop._id]) {
                        const imageSrc = shop.images && shop.images[0] ? shop.images[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                        getImageBrightness(imageSrc, shop._id);
                      }
                    }}
                  />
                  
                  {/* Property Type Badge */}
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge px-3 py-2 rounded-pill" 
                          style={{ backgroundColor: 'rgba(111, 66, 193, 0.9)', color: 'white', fontSize: '0.85rem' }}>
                      <i className="bi bi-shop me-1"></i>
                      Commercial
                    </span>
                  </div>

                  {/* Available Facilities & Amenities Overlay */}
                  <div className="position-absolute bottom-0 start-0 end-0 p-3">
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {shop.furnished && (
                        <span className="small" style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 8px',
                          color: imageColors[shop._id] === 'dark' ? '#000000' : '#ffffff',
                          textShadow: `2px 2px 4px ${imageColors[shop._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                        }}>
                          <i className="bi bi-tools me-1"></i>
                          {shop.furnished}
                        </span>
                      )}
                      {shop.roomType && (
                        <span className="small" style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 8px',
                          color: imageColors[shop._id] === 'dark' ? '#000000' : '#ffffff',
                          textShadow: `2px 2px 4px ${imageColors[shop._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                        }}>
                          <i className="bi bi-building me-1"></i>
                          {shop.roomType}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      padding: '6px 10px',
                      color: imageColors[shop._id] === 'dark' ? '#000000' : '#ffffff',
                      textShadow: `2px 2px 4px ${imageColors[shop._id] === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                    }}>
                      <i className="bi bi-info-circle me-1"></i>
                      Available Facilities & Amenities
                    </div>
                  </div>
                </div>
                
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-3">
                    <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '1.1rem' }}>
                      {shop.title}
                    </h5>
                    
                    <p className="text-muted small mb-0 d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2" style={{ color: '#6f42c1' }}></i>
                      {shop.location}
                    </p>
                  </div>
                  
                  <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {shop.description ? 
                      shop.description.substring(0, 85) + "..." : 
                      "Commercial space available for rent"
                    }
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="h5 fw-bold mb-0" style={{ color: '#000000' }}>
                          ₹{shop.price ? shop.price.toLocaleString() : 'N/A'}
                        </span>
                        <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>per month</small>
                      </div>
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
