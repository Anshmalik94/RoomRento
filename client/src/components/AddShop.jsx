import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import { API_URL } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AddRoom.css';

const AddShop = ({ token }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load Google Maps on component mount
  useEffect(() => {
    // Google Maps will be loaded by the MapPicker component
    setMapsLoaded(true);
  }, []);

  const [shopData, setShopData] = useState({
    title: '',
    description: '',
    type: 'Shop',
    price: '',
    location: '',
    latitude: null,
    longitude: null,
    amenities: [],
    rules: '',
    contactNumber: '',
    email: '',
    businessType: '',
    openingHours: '09:00',
    closingHours: '21:00',
    // Additional fields for address components
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const amenitiesList = [
    'Parking', 'CCTV', 'Security Guard', 'WiFi', 'Air Conditioning',
    'Elevator', 'Loading Dock', 'Storage Space', 'Restrooms', 'Power Backup',
    'Water Supply', 'Waste Management', 'Fire Safety', 'Disabled Access',
    'Display Windows', 'Signage Space', 'Sound System', 'Lighting'
  ];

  const businessTypes = [
    'General Store', 'Clothing', 'Electronics', 'Restaurant', 'Cafe', 
    'Salon', 'Medical', 'Office', 'Warehouse', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setShopData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // eslint-disable-next-line no-unused-vars
  const handleLocationSelect = (location, lat, lng) => {
    setShopData(prev => ({
      ...prev,
      location,
      latitude: lat,
      longitude: lng
    }));
    setShowMap(true); // Show map when location is selected
    setErrors(prev => ({ ...prev, location: '' }));
  };

  const handleUseCurrentLocation = async () => {
    // Production Security Check - Geolocation only works on HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      const errorMsg = "❌ Location access requires HTTPS. Please use secure connection.";
      setMessage(errorMsg);
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const errorMsg = "❌ Geolocation is not supported by your browser.";
      setMessage(errorMsg);
      return;
    }

    // Check for permissions first
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      if (permission.state === 'denied') {
        const errorMsg = "❌ Location access denied. Please enable location in browser settings and refresh.";
        setMessage(errorMsg);
        return;
      }
    } catch (err) {
      console.log('Permission API not supported, proceeding with geolocation request');
    }

    setLoading(true);
    setMessage("📍 Detecting your location... please wait.");

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout for production
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          // Set coordinates first
          setShopData(prev => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
          }));

          // Use reverse geocoding to get address details
          try {
            // Check if Google Maps is available
            if (!window.google?.maps?.Geocoder) {
              const warningMsg = "✅ Location detected. Please fill address details manually.";
              setMessage(warningMsg);
            } else {
              await reverseGeocode(latitude, longitude);
              setMessage("✅ Location and address detected!");
            }
          } catch (geocodeError) {
            const warningMsg = "✅ Location detected. Please fill address details manually.";
            setMessage(warningMsg);
          }

          // Show map after successful location detection
          setShowMap(true);
          
          const successMsg = `✅ Location detected successfully! (Accuracy: ${Math.round(accuracy)}m)`;
          setMessage(successMsg);
          
          setLoading(false);
          
          // Clear any existing location errors
          setErrors(prev => ({
            ...prev,
            location: ''
          }));
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          const warningMsg = "✅ Location detected but failed to fetch address. Please fill manually.";
          setMessage(warningMsg);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "❌ Location access denied. Please enable location permissions in browser settings and refresh the page.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "❌ Location information unavailable. Please check your GPS/internet connection or try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "❌ Location request timed out. Please try again or enter address manually.";
            break;
          default:
            errorMessage = "❌ An error occurred while getting your location. Please try again or enter address manually.";
            break;
        }
        
        // Production specific error message
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          errorMessage = "❌ Location access requires HTTPS connection. Please ensure secure connection.";
        }
        
        setMessage(errorMessage);
        setLoading(false);
      },
      options
    );
  };

  // Reverse geocoding function using Google Maps API
  const reverseGeocode = async (lat, lng) => {
    try {
      // Enhanced Google Maps availability check
      if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        throw new Error("Google Maps API not loaded");
      }
      // Create geocoder instance safely
      let geocoder;
      try {
        geocoder = new window.google.maps.Geocoder();
      } catch (geocoderError) {
        console.error("❌ Failed to create Geocoder:", geocoderError);
        throw new Error("Failed to initialize geocoder");
      }

      // Wrap geocoding in Promise with timeout
      const geocodePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Geocoding request timed out'));
        }, 10000); // 10 second timeout

        geocoder.geocode(
          { location: { lat: parseFloat(lat), lng: parseFloat(lng) } },
          (results, status) => {
            clearTimeout(timeoutId);
            
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed with status: ${status}`));
            }
          }
        );
      });

      const response = await geocodePromise;

      // Parse address components with better address detection
      const addressComponents = response.address_components || [];
      let formattedAddress = response.formatted_address || '';
      let city = '';
      let state = '';
      let pincode = '';
      let landmark = '';

      // Parse address components
      addressComponents.forEach(component => {
        const types = component.types || [];
        
        if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          landmark = component.long_name;
        }
      });
      // Update shop data with detected location details safely
      setShopData(prev => ({
        ...prev,
        location: formattedAddress || prev.location,
        address: formattedAddress || prev.address,
        city: city || prev.city,
        state: state || prev.state,
        pincode: pincode || prev.pincode,
        landmark: landmark || prev.landmark,
      }));

      return { success: true, formattedAddress, city, state, pincode, landmark };

    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      
      // Fallback to basic location setting without breaking the app
      try {
        setShopData((prev) => ({
          ...prev,
          location: `Lat: ${parseFloat(lat).toFixed(6)}, Lng: ${parseFloat(lng).toFixed(6)}`,
        }));
      } catch (setDataError) {
        console.error('❌ Failed to set fallback location:', setDataError);
      }

      throw error; // Re-throw to handle in calling function
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!shopData.title.trim()) newErrors.title = 'Shop name is required';
        if (!shopData.description.trim()) newErrors.description = 'Description is required';
        if (!shopData.businessType) newErrors.businessType = 'Business type is required';
        break;
      case 2:
        if (!shopData.price || shopData.price < 0) newErrors.price = 'Valid rent amount is required';
        if (!shopData.location) newErrors.location = 'Location is required';
        if (!shopData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (!shopData.email.trim()) newErrors.email = 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(shopData.email)) newErrors.email = 'Valid email is required';
        break;
      case 3:
        if (shopData.amenities.length === 0) newErrors.amenities = 'Select at least one amenity';
        break;
      case 4:
        if (images.length === 0) newErrors.images = 'At least one image is required';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append shop data
    Object.keys(shopData).forEach(key => {
      if (key === 'amenities') {
        formData.append(key, JSON.stringify(shopData[key]));
      } else {
        formData.append(key, shopData[key]);
      }
    });
    
    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });
    
    try {
      await axios.post(
        `${API_URL}/api/shops`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSubmitMessage('Shop listed successfully!');
      setSubmitType('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.location.href = '/my-listings';
        }, 100);
      }, 2000);
      
    } catch (error) {
      setSubmitMessage(error.response?.data?.message || 'Failed to list shop. Please try again.');
      setSubmitType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <i className="bi bi-shop-window me-2" style={{color: '#6f42c1'}}></i>
              Shop Information
            </h4>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Shop Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  name="title"
                  value={shopData.title}
                  onChange={handleInputChange}
                  placeholder="Enter shop/business name"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Business Type *</label>
                <select
                  className={`form-select ${errors.businessType ? 'is-invalid' : ''}`}
                  name="businessType"
                  value={shopData.businessType}
                  onChange={handleInputChange}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.businessType && <div className="invalid-feedback">{errors.businessType}</div>}
              </div>
              
              <div className="col-12">
                <label className="form-label fw-bold">Description *</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  name="description"
                  value={shopData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your shop/commercial space..."
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <i className="bi bi-geo-alt-fill me-2" style={{color: '#6f42c1'}}></i>
              Location & Contact
            </h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  name="price"
                  value={shopData.price}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Monthly rent amount"
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-bold">Opening Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="openingHours"
                  value={shopData.openingHours}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-bold">Closing Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="closingHours"
                  value={shopData.closingHours}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Contact Number *</label>
                <input
                  type="tel"
                  className={`form-control ${errors.contactNumber ? 'is-invalid' : ''}`}
                  name="contactNumber"
                  value={shopData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Your contact number"
                />
                {errors.contactNumber && <div className="invalid-feedback">{errors.contactNumber}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Email *</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={shopData.email}
                  onChange={handleInputChange}
                  placeholder="Contact email address"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              
              <div className="col-12">
                <label className="form-label fw-bold">Location *</label>
                
                <div className="mb-3">
                  <div className="d-flex flex-wrap gap-3 mb-4">
                    <button
                      type="button"
                      className="btn btn-primary flex-fill shadow-sm"
                      onClick={handleUseCurrentLocation}
                      disabled={loading}
                      style={{ minHeight: '45px' }}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        {loading ? (
                          <>
                            <LoadingSpinner 
                              isLoading={true} 
                              inline={true} 
                              size="small" 
                              showMessage={false} 
                            />
                            <span className="ms-2">Detecting Location...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            Use Current Location
                          </>
                        )}
                      </div>
                    </button>
                    
                    {shopData.latitude && shopData.longitude && (
                      <button
                        type="button"
                        className="btn btn-outline-info flex-fill shadow-sm"
                        onClick={() => setShowMap(!showMap)}
                        style={{ minHeight: '45px' }}
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <i className={`bi ${showMap ? 'bi-eye-slash' : 'bi-map'} me-2`}></i>
                          {showMap ? 'Hide Map' : 'Show Map'}
                        </div>
                      </button>
                    )}
                  </div>
                  
                  {/* Location Status */}
                  {shopData.latitude && shopData.longitude && (
                    <div className="alert alert-success border-0 py-3 mb-3" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.2rem' }}></i>
                        <div>
                          <strong className="text-success">Location Successfully Detected!</strong>
                          <div className="mt-1">
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              Coordinates: {parseFloat(shopData.latitude).toFixed(6)}, {parseFloat(shopData.longitude).toFixed(6)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className={`alert ${message.includes('success') || message.includes('✅') ? 'alert-success' : 'alert-info'} border-0 py-2 mb-3`}>
                      <small>{message}</small>
                    </div>
                  )}
                </div>
                
                {/* Manual location input as fallback */}
                <div className="mt-3">
                  <label className="form-label">Or enter location manually:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                      name="location"
                      value={shopData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter shop location"
                    />
                    {shopData.location && !showMap && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowMap(true)}
                        disabled={!mapsLoaded}
                      >
                        <i className="bi bi-map me-1"></i>
                        Show on Map
                      </button>
                    )}
                  </div>
                </div>
                
                {errors.location && <div className="text-danger small mt-1">{errors.location}</div>}
                
                {/* Map Section */}
                {showMap && shopData.latitude && shopData.longitude && (
                  <div className="mt-4">
                    <h6 className="mb-2">
                      <i className="bi bi-map me-2"></i>
                      Interactive Location Map
                    </h6>
                    <div className="border rounded overflow-hidden shadow-sm">
                      <ErrorBoundary component="map">
                        <MapPicker
                          latitude={parseFloat(shopData.latitude)}
                          longitude={parseFloat(shopData.longitude)}
                          setLatLng={(latLng) => {
                            setShopData(prev => ({
                              ...prev,
                              latitude: latLng.lat,
                              longitude: latLng.lng
                            }));
                          }}
                          onLocationSelect={(location, lat, lng) => {
                            setShopData(prev => ({
                              ...prev,
                              latitude: lat,
                              longitude: lng
                            }));
                            // Optionally reverse geocode the new location
                            reverseGeocode(lat, lng);
                          }}
                        />
                      </ErrorBoundary>
                    </div>
                    
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted d-block">
                        <i className="bi bi-cursor me-1"></i>
                        <strong>Tip:</strong> Click anywhere on the map to set precise location for your shop
                      </small>
                    </div>
                  </div>
                )}
                
                {shopData.location && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted">Selected: {shopData.location}</small>
                  </div>
                )}
              </div>

              {/* Address Details Section */}
              <div className="row g-3 mt-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={shopData.city || ''}
                    onChange={handleInputChange}
                    placeholder="Enter city name (e.g. Delhi, Mumbai)"
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Avoid division names, enter actual city name
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">State</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={shopData.state || ''}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Full Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={shopData.address || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter complete address with shop number, street, area..."
                  />
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i>
                    This will be auto-filled when you use current location
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pincode"
                    value={shopData.pincode || ''}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Landmark</label>
                  <input
                    type="text"
                    className="form-control"
                    name="landmark"
                    value={shopData.landmark || ''}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <i className="bi bi-star-fill me-2" style={{color: '#6f42c1'}}></i>
              Amenities & Rules
            </h4>
            
            <div className="mb-4">
              <label className="form-label fw-bold">Shop Amenities *</label>
              <div className="row g-2">
                {amenitiesList.map(amenity => (
                  <div key={amenity} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={shopData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <label className="form-check-label small">{amenity}</label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.amenities && <div className="text-danger small mt-1">{errors.amenities}</div>}
            </div>
            
            <div>
              <label className="form-label fw-bold">Terms & Conditions</label>
              <textarea
                className="form-control"
                name="rules"
                value={shopData.rules}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter terms and conditions for renting..."
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <i className="bi bi-images me-2" style={{color: '#6f42c1'}}></i>
              Shop Images
            </h4>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Upload Images (Max 5) *</label>
              <input
                type="file"
                className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={images.length >= 5}
              />
              {errors.images && <div className="invalid-feedback">{errors.images}</div>}
              <small className="form-text text-muted">
                Upload high-quality images of your shop. First image will be the main image.
              </small>
            </div>
            
            {images.length > 0 && (
              <div className="row g-3">
                {images.map((image, index) => (
                  <div key={index} className="col-md-4 col-6">
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Shop ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                        onClick={() => removeImage(index)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                      {index === 0 && (
                        <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                          Main Image
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-light rounded">
              <h5 className="fw-bold mb-3">Review Your Shop Listing</h5>
              <div className="row g-2">
                <div className="col-md-6"><strong>Name:</strong> {shopData.title}</div>
                <div className="col-md-6"><strong>Category:</strong> {shopData.category}</div>
                <div className="col-md-6"><strong>Business Type:</strong> {shopData.businessType}</div>
                <div className="col-md-6"><strong>Area:</strong> {shopData.shopArea} sq ft</div>
                <div className="col-md-6"><strong>Monthly Rent:</strong> ₹{shopData.price}</div>
                <div className="col-md-6"><strong>Contact:</strong> {shopData.contactNumber}</div>
                <div className="col-md-6"><strong>Email:</strong> {shopData.email}</div>
                <div className="col-md-6"><strong>Parking:</strong> {shopData.parkingSpaces || 'N/A'} spaces</div>
                <div className="col-12"><strong>Location:</strong> {shopData.location}</div>
                <div className="col-12"><strong>Amenities:</strong> {shopData.amenities.join(', ')}</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%)', minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header text-white p-4 rounded-top-4" style={{background: '#6f42c1'}}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1 fw-bold">
                      <i className="bi bi-shop-window me-2"></i>
                      List Your Shop
                    </h2>
                    <p className="mb-0 opacity-75">Rent out your commercial space</p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-light text-dark fs-6 px-3 py-2">
                      Step {currentStep} of 4
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                {/* Horizontal Step Indicators with Gradient */}
                <div className="horizontal-step-indicators mb-4">
                  <div className="step-indicators-background">
                    {[1, 2, 3, 4].map((step, index) => (
                      <React.Fragment key={step}>
                        <div
                          className={`step-indicator ${
                            currentStep >= step ? 'active' : ''
                          }`}
                        >
                          <span className="step-number">{step}</span>
                          <span className="step-label">
                            {step === 1 && 'Shop Details'}
                            {step === 2 && 'Location & Pricing'}
                            {step === 3 && 'Features & Contact'}
                            {step === 4 && 'Photos & Review'}
                          </span>
                        </div>
                        {index < 3 && <div className="step-connector"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="progress mb-4" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    style={{ width: `${(currentStep / 4) * 100}%`, backgroundColor: '#6f42c1' }}
                  ></div>
                </div>
                
                {submitMessage && (
                  <div className={`alert ${submitType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                    <i className={`bi ${submitType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                    {submitMessage}
                  </div>
                )}
                
                {/* Step Content */}
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Previous
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="btn px-4"
                      style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                      onClick={nextStep}
                    >
                      Next
                      <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn px-4"
                      style={{backgroundColor: '#6f42c1', color: 'white', border: 'none'}}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner 
                            isLoading={true} 
                            inline={true} 
                            size="small" 
                            showMessage={false} 
                          />
                          <span className="ms-2">Listing Shop...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          List Shop
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddShop;
