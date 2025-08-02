import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { loadGoogleMapsScript } from "./LoadGoogleMaps";
import ErrorBoundary from './ErrorBoundary';
import MapPicker from "./MapPicker";
import LoadingSpinner from "./LoadingSpinner";
import { Card, Row, Col, Form, Button, Toast, ToastContainer } from "react-bootstrap";

function AddRoom({ token, isEdit = false }) {
  const { id } = useParams(); // Get property ID from URL for editing
  const [propertyType, setPropertyType] = useState('Room'); // Track property type for edit mode
  
  const [data, setData] = useState({
    title: "",
    description: "",
    price: "",
    phone: "",
    location: "",
    roomType: "",
    furnished: "",
    pincode: "",
    city: "",
    state: "",
    landmark: "",
    address: "",
    latitude: "",
    longitude: "",
    facilities: [],
    maxOccupancy: 1,
    area: ""
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success'); // success, danger, warning, info
  
  const navigate = useNavigate();

  // Fetch property data for editing
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Try to fetch from different endpoints to determine property type
        let response;
        let type;
        
        try {
          response = await axios.get(`${API_URL}/api/rooms/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          type = 'Room';
        } catch {
          try {
            response = await axios.get(`${API_URL}/api/hotels/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            type = 'Hotel';
          } catch {
            response = await axios.get(`${API_URL}/api/shops/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            type = 'Shop';
          }
        }

        if (response && response.data) {
          const property = response.data;
          setPropertyType(type);
          
          // Map property data to form fields
          setData({
            title: property.title || "",
            description: property.description || "",
            price: property.price || property.rent || "",
            phone: property.phone || property.contactNumber || "",
            location: property.location || property.city || "",
            roomType: property.roomType || property.category || "",
            furnished: property.furnished || "",
            pincode: property.pincode || "",
            city: property.city || property.location || "",
            state: property.state || "",
            landmark: property.landmark || "",
            address: property.address || "",
            latitude: property.latitude || "",
            longitude: property.longitude || "",
            facilities: property.facilities || property.amenities || [],
            maxOccupancy: property.maxOccupancy || 1,
            area: property.area || ""
          });

          // Set existing images
          if (property.images && property.images.length > 0) {
            setImagePreviews(property.images);
          }

          showToastMessage('Property data loaded successfully!', 'success');
        }
      } catch (error) {
        showToastMessage('Error loading property data', 'danger');
      } finally {
        setLoading(false);
      }
    };

    if (isEdit && id) {
      fetchPropertyData();
    }
  }, [isEdit, id, showToastMessage]);

  const facilityOptions = [
    'Wi-Fi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Security', 
    'Laundry', 'Power Backup', 'Elevator', 'Garden', 'Balcony', 
    'Furnished', 'TV', 'Refrigerator', 'Washing Machine', 'Kitchen'
  ];

  const roomTypes = [
    'Single Room', 'Double Room', 'Shared Room', 'Studio Apartment',
    'PG for Boys', 'PG for Girls', 'Family Room', 'Flat/Apartment'
  ];

  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];

  // Toast utility function
  const showToastMessage = useCallback((message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  }, []);

  // Toast helper functions
  const getToastBg = (variant) => {
    switch(variant) {
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  };

  const getToastIcon = (variant) => {
    switch(variant) {
      case 'success': return '✅';
      case 'danger': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getToastTitle = (variant) => {
    switch(variant) {
      case 'success': return 'Success';
      case 'danger': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFacilityChange = (facility) => {
    const updatedFacilities = data.facilities.includes(facility)
      ? data.facilities.filter(f => f !== facility)
      : [...data.facilities, facility];
    
    setData({ ...data, facilities: updatedFacilities });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      setMessage('You can upload maximum 5 images');
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!data.title.trim()) newErrors.title = 'Title is required';
        if (!data.description.trim()) newErrors.description = 'Description is required';
        if (!data.roomType) newErrors.roomType = 'Room type is required';
        if (!data.furnished) newErrors.furnished = 'Furnished status is required';
        break;
      case 2:
        if (!data.price) newErrors.price = 'Price is required';
        if (data.price < 0) newErrors.price = 'Price cannot be negative';
        if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!/^\d{10}$/.test(data.phone)) newErrors.phone = 'Phone number must be 10 digits';
        break;
      case 3:
        if (!data.city.trim()) newErrors.city = 'City is required';
        if (!data.address.trim()) newErrors.address = 'Address is required';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleUseCurrentLocation = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const errorMsg = "❌ Geolocation is not supported by your browser.";
      setMessage(errorMsg);
      showToastMessage(errorMsg, 'danger');
      return;
    }

    // Check for permissions first
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      if (permission.state === 'denied') {
        const errorMsg = "❌ Location access denied. Please enable location in browser settings.";
        setMessage(errorMsg);
        showToastMessage(errorMsg, 'danger');
        return;
      }
    } catch (err) {
    }

    setLoading(true);
    setMessage("📍 Detecting your location... please wait.");
    showToastMessage("📍 Detecting location...", 'info');

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          // Set coordinates first
          setData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          // Use reverse geocoding to get address details
          try {
            // First ensure Google Maps is loaded
            await loadGoogleMapsScript();
            
            // Now do reverse geocoding
            if (!window.google?.maps?.Geocoder) {
              const warningMsg = "✅ Location detected. Please fill address details manually.";
              setMessage(warningMsg);
              showToastMessage("📍 Location detected, fill address manually", 'warning');
            } else {
              await reverseGeocode(latitude, longitude);
              showToastMessage("✅ Location and address detected!", 'success');
            }
          } catch (geocodeError) {
            const warningMsg = "✅ Location detected. Please fill address details manually.";
            setMessage(warningMsg);
            showToastMessage("📍 Location detected, fill address manually", 'warning');
          }
          
          // Show map after successful location detection
          setShowMap(true);
          
          const successMsg = `✅ Location detected successfully! (Accuracy: ${Math.round(accuracy)}m)`;
          setMessage(successMsg);
          
          setLoading(false);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          const warningMsg = "✅ Location detected but failed to fetch address. Please fill manually.";
          setMessage(warningMsg);
          showToastMessage("⚠️ Location detected, please fill address manually", 'warning');
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "❌ Location access denied. Please allow location in your browser and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "❌ Location information unavailable. Please check your GPS or try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "❌ Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "❌ An unknown location error occurred. Please try again.";
            break;
        }
        
        setMessage(errorMessage);
        showToastMessage(errorMessage, 'danger');
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

      // Parse address components with better city detection
      const addressComponents = response.address_components || [];
      let address = response.formatted_address || '';
      let pincode = '';
      let city = '';
      let state = '';
      let landmark = '';
      let district = '';

      // First pass - collect all components
      addressComponents.forEach(component => {
        const types = component.types || [];
        
        if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name; // Preferred city name
        }
        if (types.includes('administrative_area_level_2')) {
          district = component.long_name; // District/Division name
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          landmark = component.long_name;
        }
      });

      // Smart city detection - avoid divisions
      if (!city && district) {
        // If no locality found, check if district is a valid city name
        // Avoid common division patterns
        const divisionPatterns = /division|district|tehsil|block/i;
        if (!divisionPatterns.test(district)) {
          city = district;
        }
      }

      // Fallback for city detection
      if (!city) {
        addressComponents.forEach(component => {
          const types = component.types || [];
          if (types.includes('sublocality') || 
              types.includes('administrative_area_level_3')) {
            if (!city) city = component.long_name;
          }
        });
      }

      // Final fallback - extract from formatted address
      if (!city && address) {
        const addressParts = address.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          city = addressParts[addressParts.length - 3] || addressParts[1];
        }
      }

      // Update form data with detected location details safely
      setData((prev) => ({
        ...prev,
        address: address || prev.address,
        pincode: pincode || prev.pincode,
        city: city || prev.city,
        state: state || prev.state,
        landmark: landmark || prev.landmark,
        location: city && state ? `${city}, ${state}` : prev.location,
      }));

      return { success: true, address, city, state, pincode, landmark };

    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      
      // Fallback to basic location setting without breaking the app
      try {
        setData((prev) => ({
          ...prev,
          location: `Lat: ${parseFloat(lat).toFixed(6)}, Lng: ${parseFloat(lng).toFixed(6)}`,
        }));
      } catch (setDataError) {
        console.error('❌ Failed to set fallback location:', setDataError);
      }

      throw error; // Re-throw to handle in calling function
    }
  };

  // Function to handle map marker changes
  const handleMapLocationChange = (latLng) => {
    setData((prev) => ({
      ...prev,
      latitude: latLng.lat.toString(),
      longitude: latLng.lng.toString(),
    }));

    // Optionally reverse geocode the new location
    reverseGeocode(latLng.lat, latLng.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      const errorMsg = "Please fill all required fields correctly.";
      setMessage(errorMsg);
      showToastMessage(errorMsg, 'danger');
      return;
    }

    if (images.length === 0) {
      const errorMsg = "Please upload at least one image.";
      setMessage(errorMsg);
      showToastMessage(errorMsg, 'warning');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    
    // Add all data fields
    Object.keys(data).forEach((key) => {
      if (key === 'facilities') {
        // Send facilities as a JSON string or as individual entries
        data[key].forEach(facility => {
          formData.append('facilities[]', facility);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    
    // Add images
    Array.from(images).forEach((img) => formData.append("images", img));

    try {
      const authToken = token || localStorage.getItem("token");
      
      if (!authToken) {
        setMessage("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      // Determine API endpoint and method based on edit mode
      let response;
      if (isEdit && id) {
        // Update existing property
        const endpoint = propertyType === 'Hotel' ? 'hotels' : propertyType === 'Shop' ? 'shops' : 'rooms';
        response = await axios.put(`${API_URL}/api/${endpoint}/${id}`, formData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
      } else {
        // Create new property
        response = await axios.post(`${API_URL}/api/rooms`, formData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
      }
      
      // Success message
      const successMsg = isEdit 
        ? `🎉 ${propertyType} updated successfully!` 
        : "🎉 Room added successfully!";
      setMessage(successMsg);
      showToastMessage(successMsg, 'success');
      
      setTimeout(() => {
        navigate("/owner-dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error adding room:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to add room. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
        console.error("Server error data:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
        console.error("No response received:", error.request);
      } else {
        // Something else happened
        errorMessage = error.message;
        console.error("Request setup error:", error.message);
      }
      
      setMessage(errorMessage);
      showToastMessage(`❌ ${errorMessage}`, 'danger');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="step-card">
            <Card.Header className="step-header bg-primary text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-house-door me-2"></i>
                <h5 className="mb-0">Basic Information</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Property Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={data.title}
                      onChange={handleChange}
                      placeholder="Enter property title"
                      isInvalid={!!errors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Type *</Form.Label>
                    <Form.Select
                      name="roomType"
                      value={data.roomType}
                      onChange={handleChange}
                      isInvalid={!!errors.roomType}
                    >
                      <option value="">Select room type</option>
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.roomType}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  placeholder="Describe your property"
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Furnished Status *</Form.Label>
                    <Form.Select
                      name="furnished"
                      value={data.furnished}
                      onChange={handleChange}
                      isInvalid={!!errors.furnished}
                    >
                      <option value="">Select furnished status</option>
                      {furnishedOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.furnished}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Occupancy</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxOccupancy"
                      value={data.maxOccupancy}
                      onChange={handleChange}
                      min="1"
                      max="10"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area (sq ft)</Form.Label>
                    <Form.Control
                      type="text"
                      name="area"
                      value={data.area}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card className="step-card">
            <Card.Header className="step-header bg-success text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-currency-rupee me-2"></i>
                <h5 className="mb-0">Pricing & Contact</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Rent (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={data.price}
                      onChange={handleChange}
                      placeholder="Enter monthly rent"
                      isInvalid={!!errors.price}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={data.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      isInvalid={!!errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Available Facilities</Form.Label>
                <div className="facilities-grid">
                  {facilityOptions.map((facility) => (
                    <div key={facility} className="facility-item">
                      <Form.Check
                        type="checkbox"
                        id={`facility-${facility}`}
                        label={facility}
                        checked={data.facilities.includes(facility)}
                        onChange={() => handleFacilityChange(facility)}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card className="step-card">
            <Card.Header className="step-header bg-info text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt me-2"></i>
                <h5 className="mb-0">Location Details</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <Button
                    variant="primary"
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    className="flex-fill shadow-sm"
                    style={{ minHeight: '45px' }}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Detecting Location...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-geo-alt-fill me-2"></i>
                          Use Current Location
                        </>
                      )}
                    </div>
                  </Button>
                  
                  {data.latitude && data.longitude && (
                    <Button
                      variant="outline-info"
                      onClick={() => setShowMap(!showMap)}
                      className="flex-fill shadow-sm"
                      style={{ minHeight: '45px' }}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        <i className={`bi ${showMap ? 'bi-eye-slash' : 'bi-map'} me-2`}></i>
                        {showMap ? 'Hide Map' : 'Show Map'}
                      </div>
                    </Button>
                  )}
                </div>

                {/* Location Status */}
                {data.latitude && data.longitude && (
                  <div className="alert alert-success border-0 py-3 mb-3" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.2rem' }}></i>
                      <div>
                        <strong className="text-success">Location Successfully Detected!</strong>
                        <div className="mt-1">
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            Coordinates: {parseFloat(data.latitude).toFixed(6)}, {parseFloat(data.longitude).toFixed(6)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Section */}
                {showMap && mapsLoaded && data.latitude && data.longitude && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="mb-0 text-primary">
                        <i className="bi bi-map me-2"></i>
                        Interactive Location Map
                      </h6>
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Click to adjust location
                      </small>
                    </div>
                    <div className="border rounded overflow-hidden shadow-sm">
                      <ErrorBoundary component="map">
                        <MapPicker
                          latitude={parseFloat(data.latitude)}
                          longitude={parseFloat(data.longitude)}
                          setLatLng={handleMapLocationChange}
                        />
                      </ErrorBoundary>
                    </div>
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted d-block">
                        <i className="bi bi-cursor me-1"></i>
                        <strong>Tip:</strong> Click anywhere on the map to set precise location for your property
                      </small>
                    </div>
                  </div>
                )}
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={data.city}
                      onChange={handleChange}
                      placeholder="Enter city name (e.g. Delhi, Mumbai)"
                      isInvalid={!!errors.city}
                      autoComplete="address-level2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.city}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Avoid division names, enter actual city name
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={data.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Full Address *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  placeholder="Enter complete address with house/flat number, street, area..."
                  isInvalid={!!errors.address}
                  autoComplete="street-address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  <i className="bi bi-geo-alt me-1"></i>
                  This will be auto-filled when you use current location
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      value={data.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Landmark</Form.Label>
                    <Form.Control
                      type="text"
                      name="landmark"
                      value={data.landmark}
                      onChange={handleChange}
                      placeholder="Nearby landmark"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 4:
        return (
          <Card className="step-card">
            <Card.Header className="step-header bg-warning text-dark">
              <div className="d-flex align-items-center">
                <i className="bi bi-images me-2"></i>
                <h5 className="mb-0">Property Images</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Upload Images (Max 5)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                />
                <Form.Text className="text-muted">
                  Upload high-quality images of your property. Maximum 5 images allowed.
                </Form.Text>
              </Form.Group>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  <h6>Image Previews:</h6>
                  <Row>
                    {imagePreviews.map((preview, index) => (
                      <Col key={index} md={3} className="mb-3">
                        <div className="image-preview">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded"
                            loading="lazy"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  // Load Google Maps on component mount
  React.useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapsLoaded(true))
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
        setMapsLoaded(true); // Continue anyway
      });
  }, []);

  return (
    <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%)', minHeight: '100vh' }}>
      {loading && <LoadingSpinner isLoading={loading} message="Adding your property..." />}
      
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          bg={getToastBg(toastVariant)}
          text={toastVariant === 'warning' ? 'dark' : 'white'}
          delay={5000}
          autohide
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">
              {getToastIcon(toastVariant)} {getToastTitle(toastVariant)}
            </strong>
          </Toast.Header>
          <Toast.Body className="fw-medium">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header text-white p-4 rounded-top-4" style={{background: '#6f42c1'}}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1 fw-bold">
                      <i className="bi bi-house-door me-2"></i>
                      {isEdit ? `Edit ${propertyType}` : 'Add New Property'}
                    </h2>
                    <p className="mb-0 opacity-75">
                      {isEdit ? `Update your ${propertyType.toLowerCase()} details` : 'List your property in 4 simple steps'}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-light text-dark fs-6 px-3 py-2">
                      Step {currentStep} of 4
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                {/* Progress Bar */}
                <div className="progress-section mb-4">
                  {/* Horizontal Step Indicators with Gradient */}
                  <div className="horizontal-step-indicators mb-3">
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
                              {step === 1 && 'Property Details'}
                              {step === 2 && 'Location & Pricing'}
                              {step === 3 && 'Features & Amenities'}
                              {step === 4 && 'Photos & Review'}
                            </span>
                          </div>
                          {index < 3 && <div className="step-connector"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress mb-3" style={{height: '8px', backgroundColor: 'rgba(111, 66, 193, 0.1)'}}>
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${(currentStep / 4) * 100}%`,
                        backgroundColor: '#6f42c1'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Alert Messages */}
                {message && (
                  <div 
                    className={`alert ${message.includes('success') ? 'alert-success' : 'alert-info'} mb-4 border-0`}
                    style={{
                      backgroundColor: message.includes('success') ? 'rgba(25, 135, 84, 0.1)' : 'rgba(13, 202, 240, 0.1)',
                      color: '#000'
                    }}
                  >
                    {message}
                  </div>
                )}

                {/* Step Content */}
                <form onSubmit={handleSubmit}>
                  {renderStepContent()}

                  {/* Upload Progress */}
                  {loading && uploadProgress > 0 && (
                    <div className="mb-3">
                      <div className="progress" style={{height: '8px', backgroundColor: 'rgba(111, 66, 193, 0.1)'}}>
                        <div 
                          className="progress-bar" 
                          style={{
                            width: `${uploadProgress}%`,
                            backgroundColor: '#6f42c1'
                          }}
                        ></div>
                      </div>
                      <p className="text-center mt-2 small" style={{color: '#6f42c1'}}>
                        {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="form-navigation mt-4">
                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={prevStep}
                        disabled={currentStep === 1 || loading}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Previous
                      </button>

                      <div>
                        {currentStep < 4 ? (
                          <button
                            type="button"
                            className="btn btn-primary rounded-pill"
                            onClick={nextStep}
                            disabled={loading}
                          >
                            Next
                            <i className="bi bi-arrow-right ms-2"></i>
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="btn btn-success rounded-pill"
                            disabled={loading || images.length === 0}
                          >
                            {loading ? (
                              <>
                                <span className="loading-spinner me-2" style={{width: '16px', height: '16px'}}></span>
                                {isEdit ? `Updating ${propertyType}...` : 'Adding Property...'}
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                {isEdit ? `Update ${propertyType}` : 'Rentify'}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRoom;