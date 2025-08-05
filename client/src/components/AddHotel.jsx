import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import { loadGoogleMapsScript } from './LoadGoogleMaps';
import { API_URL } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AddRoom.css';

const AddHotel = ({ token, isEdit = false }) => {
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
    loadGoogleMapsScript()
      .then(() => setMapsLoaded(true))
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
        setMapsLoaded(true); // Continue anyway
      });
  }, []);

  const [hotelData, setHotelData] = useState({
    title: '',
    description: '',
    type: 'Hotel',
    category: 'Budget',
    price: '',
    location: '',
    latitude: null,
    longitude: null,
    amenities: [],
    rules: '',
    contactNumber: '',
    email: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    totalRooms: '',
    roomTypes: []
  });

  const amenitiesList = [
    'WiFi', 'Air Conditioning', 'TV', 'Mini Fridge', 'Room Service',
    'Laundry Service', 'Parking', 'Swimming Pool', 'Gym', 'Restaurant',
    'Bar', 'Spa', 'Conference Room', 'Airport Shuttle', 'Pet Friendly',
    'Concierge', 'Business Center', 'Elevator', '24/7 Reception'
  ];

  const hotelCategories = ['Budget', 'Mid-Range', 'Luxury', 'Boutique', 'Resort'];
  const roomTypesList = ['Standard', 'Deluxe', 'Suite', 'Family Room', 'Executive'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHotelData(prev => ({
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
    setHotelData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRoomTypeChange = (roomType) => {
    setHotelData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(roomType)
        ? prev.roomTypes.filter(rt => rt !== roomType)
        : [...prev.roomTypes, roomType]
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
    setHotelData(prev => ({
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
          setHotelData(prev => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
          }));

          // Try reverse geocoding to get address details
          const address = await reverseGeocode(latitude, longitude);
          
          // If geocoding fails, set a basic location string
          if (!address) {
            const basicLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            setHotelData(prev => ({
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
          setHotelData(prev => ({
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
      
      // Update hotel data with detected location
      setHotelData(prev => ({
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
        if (!hotelData.title.trim()) newErrors.title = 'Hotel name is required';
        if (!hotelData.description.trim()) newErrors.description = 'Description is required';
        if (!hotelData.category) newErrors.category = 'Category is required';
        if (!hotelData.totalRooms || hotelData.totalRooms < 1) newErrors.totalRooms = 'Total rooms must be at least 1';
        break;
      case 2:
        if (!hotelData.price || hotelData.price < 0) newErrors.price = 'Valid price is required';
        if (!hotelData.location) newErrors.location = 'Location is required';
        if (!hotelData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (!hotelData.email.trim()) newErrors.email = 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(hotelData.email)) newErrors.email = 'Valid email is required';
        break;
      case 3:
        if (hotelData.amenities.length === 0) newErrors.amenities = 'Select at least one amenity';
        if (hotelData.roomTypes.length === 0) newErrors.roomTypes = 'Select at least one room type';
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
    
    if (!token) {
      setSubmitMessage('Authentication required. Please login again.');
      setSubmitType('error');
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append hotel data
    Object.keys(hotelData).forEach(key => {
      if (key === 'amenities' || key === 'roomTypes') {
        formData.append(key, JSON.stringify(hotelData[key]));
      } else {
        formData.append(key, hotelData[key]);
      }
    });
    
    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });
    
    try {
      await axios.post(
        `${API_URL}/api/hotels`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSubmitMessage('Hotel listed successfully!');
      setSubmitType('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.location.href = '/my-listings';
        }, 100);
      }, 2000);
      
    } catch (error) {
      setSubmitMessage(error.response?.data?.message || 'Failed to list hotel. Please try again.');
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
              <i className="bi bi-building-fill me-2" style={{color: '#6f42c1'}}></i>
              Hotel Information
            </h4>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Hotel Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  name="title"
                  value={hotelData.title}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Category *</label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  name="category"
                  value={hotelData.category}
                  onChange={handleInputChange}
                >
                  {hotelCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Total Rooms *</label>
                <input
                  type="number"
                  className={`form-control ${errors.totalRooms ? 'is-invalid' : ''}`}
                  name="totalRooms"
                  value={hotelData.totalRooms}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Number of rooms"
                />
                {errors.totalRooms && <div className="invalid-feedback">{errors.totalRooms}</div>}
              </div>
              
              <div className="col-12">
                <label className="form-label fw-bold">Description *</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  name="description"
                  value={hotelData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your hotel..."
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
                <label className="form-label fw-bold">Price per Night (₹) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  name="price"
                  value={hotelData.price}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Starting price per night"
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-bold">Check-in Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="checkInTime"
                  value={hotelData.checkInTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-bold">Check-out Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="checkOutTime"
                  value={hotelData.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Contact Number *</label>
                <input
                  type="tel"
                  className={`form-control ${errors.contactNumber ? 'is-invalid' : ''}`}
                  name="contactNumber"
                  value={hotelData.contactNumber}
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
                  value={hotelData.email}
                  onChange={handleInputChange}
                  placeholder="Hotel email address"
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
                      value={hotelData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter hotel location"
                    />
                    {hotelData.location && !showMap && (
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
                {showMap && mapsLoaded && hotelData.latitude && hotelData.longitude && (
                  <div className="mt-4">
                    <h6 className="mb-2">
                      <i className="bi bi-map me-2"></i>
                      Location on Map
                    </h6>
                    <div className="border rounded overflow-hidden">
                      <MapPicker
                        latitude={parseFloat(hotelData.latitude)}
                        longitude={parseFloat(hotelData.longitude)}
                        onLocationSelect={(latLng) => {
                          setHotelData(prev => ({
                            ...prev,
                            latitude: latLng.lat,
                            longitude: latLng.lng
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {hotelData.location && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted">Selected: {hotelData.location}</small>
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
              Amenities & Room Types
            </h4>
            
            <div className="mb-4">
              <label className="form-label fw-bold">Hotel Amenities *</label>
              <div className="row g-2">
                {amenitiesList.map(amenity => (
                  <div key={amenity} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={hotelData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <label className="form-check-label small">{amenity}</label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.amenities && <div className="text-danger small mt-1">{errors.amenities}</div>}
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold">Room Types Available *</label>
              <div className="row g-2">
                {roomTypesList.map(roomType => (
                  <div key={roomType} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={hotelData.roomTypes.includes(roomType)}
                        onChange={() => handleRoomTypeChange(roomType)}
                      />
                      <label className="form-check-label">{roomType}</label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.roomTypes && <div className="text-danger small mt-1">{errors.roomTypes}</div>}
            </div>
            
            <div>
              <label className="form-label fw-bold">Hotel Rules & Policies</label>
              <textarea
                className="form-control"
                name="rules"
                value={hotelData.rules}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter hotel rules and policies..."
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <i className="bi bi-images me-2" style={{color: '#6f42c1'}}></i>
              Hotel Images
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
                Upload high-quality images of your hotel. First image will be the main image.
              </small>
            </div>
            
            {images.length > 0 && (
              <div className="row g-3">
                {images.map((image, index) => (
                  <div key={index} className="col-md-4 col-6">
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Hotel ${index + 1}`}
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
              <h5 className="fw-bold mb-3">Review Your Hotel Listing</h5>
              <div className="row g-2">
                <div className="col-md-6"><strong>Name:</strong> {hotelData.title}</div>
                <div className="col-md-6"><strong>Category:</strong> {hotelData.category}</div>
                <div className="col-md-6"><strong>Total Rooms:</strong> {hotelData.totalRooms}</div>
                <div className="col-md-6"><strong>Price:</strong> ₹{hotelData.price}/night</div>
                <div className="col-md-6"><strong>Contact:</strong> {hotelData.contactNumber}</div>
                <div className="col-md-6"><strong>Email:</strong> {hotelData.email}</div>
                <div className="col-12"><strong>Location:</strong> {hotelData.location}</div>
                <div className="col-12"><strong>Amenities:</strong> {hotelData.amenities.join(', ')}</div>
                <div className="col-12"><strong>Room Types:</strong> {hotelData.roomTypes.join(', ')}</div>
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
                      <i className="bi bi-building-add me-2"></i>
                      List Your Hotel
                    </h2>
                    <p className="mb-0 opacity-90">Share your hotel with travelers worldwide</p>
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
                            {step === 1 && 'Hotel Details'}
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
                          Listing Hotel...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          List Hotel
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

export default AddHotel;
