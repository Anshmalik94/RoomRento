import React, { useState } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import LoadGoogleMaps from './LoadGoogleMaps';
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

  const [shopData, setShopData] = useState({
    title: '',
    description: '',
    type: 'Shop',
    category: 'Retail',
    price: '',
    location: '',
    latitude: null,
    longitude: null,
    amenities: [],
    rules: '',
    contactNumber: '',
    email: '',
    shopArea: '',
    businessType: '',
    openingHours: '09:00',
    closingHours: '21:00',
    parkingSpaces: ''
  });

  const amenitiesList = [
    'Parking', 'CCTV', 'Security Guard', 'WiFi', 'Air Conditioning',
    'Elevator', 'Loading Dock', 'Storage Space', 'Restrooms', 'Power Backup',
    'Water Supply', 'Waste Management', 'Fire Safety', 'Disabled Access',
    'Display Windows', 'Signage Space', 'Sound System', 'Lighting'
  ];

  const shopCategories = ['Retail', 'Food & Beverage', 'Services', 'Office Space', 'Warehouse'];
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setMessage("Detecting your location... please wait.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Set coordinates first
          setShopData(prev => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
          }));

          // Try reverse geocoding to get address details
          const address = await reverseGeocode(latitude, longitude);
          
          // If geocoding fails, set a basic location string
          if (!address) {
            const basicLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            setShopData(prev => ({
              ...prev,
              location: basicLocation
            }));
          }
          
          setMessage("Location detected successfully!");
          setLoading(false);
          setShowMap(true); // Show map after location detection
          
          // Clear any existing location errors
          setErrors(prev => ({
            ...prev,
            location: ''
          }));
        } catch (error) {
          // Still set basic location even if geocoding fails
          const basicLocation = `Location detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setShopData(prev => ({
            ...prev,
            location: basicLocation
          }));
          setMessage("Location detected successfully!");
          setLoading(false);
          setShowMap(true); // Show map even if geocoding fails
          
          // Clear any existing location errors
          setErrors(prev => ({
            ...prev,
            location: ''
          }));
        }
      },
      (error) => {
        setMessage("Failed to detect location. Please allow location access and ensure GPS is turned on.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Reverse geocoding function using Google Maps API
  const reverseGeocode = async (lat, lng) => {
    try {
      if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        console.warn("Google Maps not available for geocoding");
        return null;
      }

      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      // Parse address components
      // eslint-disable-next-line no-unused-vars
      const addressComponents = response.address_components;
      const formattedAddress = response.formatted_address;
      
      // Update shop data with detected location
      setShopData(prev => ({
        ...prev,
        location: formattedAddress
      }));

      return formattedAddress;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!shopData.title.trim()) newErrors.title = 'Shop name is required';
        if (!shopData.description.trim()) newErrors.description = 'Description is required';
        if (!shopData.category) newErrors.category = 'Category is required';
        if (!shopData.businessType) newErrors.businessType = 'Business type is required';
        if (!shopData.shopArea || shopData.shopArea < 1) newErrors.shopArea = 'Shop area is required';
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
        window.location.href = '/my-listings';
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
                <label className="form-label fw-bold">Category *</label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  name="category"
                  value={shopData.category}
                  onChange={handleInputChange}
                >
                  {shopCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
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
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Shop Area (sq ft) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.shopArea ? 'is-invalid' : ''}`}
                  name="shopArea"
                  value={shopData.shopArea}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Area in square feet"
                />
                {errors.shopArea && <div className="invalid-feedback">{errors.shopArea}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Parking Spaces</label>
                <input
                  type="number"
                  className="form-control"
                  name="parkingSpaces"
                  value={shopData.parkingSpaces}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of parking spaces"
                />
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
                  <button
                    type="button"
                    className="btn btn-outline-primary mb-3"
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                  >
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Use Current Location
                  </button>
                  
                  {message && (
                    <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-info'} py-2`}>
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
                {showMap && mapsLoaded && shopData.latitude && shopData.longitude && (
                  <div className="mt-4">
                    <h6 className="mb-2">
                      <i className="bi bi-map me-2"></i>
                      Location on Map
                    </h6>
                    <div className="border rounded overflow-hidden">
                      <MapPicker
                        latitude={parseFloat(shopData.latitude)}
                        longitude={parseFloat(shopData.longitude)}
                        onLocationSelect={(latLng) => {
                          setShopData(prev => ({
                            ...prev,
                            latitude: latLng.lat,
                            longitude: latLng.lng
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {shopData.location && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted">Selected: {shopData.location}</small>
                  </div>
                )}
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
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Listing Shop...
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
      
      {/* Load Google Maps */}
      <LoadGoogleMaps onLoad={() => setMapsLoaded(true)} />
    </div>
  );
};

export default AddShop;
