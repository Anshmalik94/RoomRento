import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadGoogleMaps from "./LoadGoogleMaps";
import MapPicker from "./MapPicker";
import LoadingSpinner from "./LoadingSpinner";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

function AddRoom({ token }) {
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
  const navigate = useNavigate();

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
          setData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          // Use reverse geocoding to get address details
          await reverseGeocode(latitude, longitude);
          
          // Show map after successful location detection
          setShowMap(true);
          if (!window.google || !window.google.maps || !window.google.maps.Map) {
            console.error("Google Maps API is not loaded properly.");
            setMessage("Map failed to load. Please try again later.");
            return;
          }

          // Initialize map with detected location
          const mapElement = document.getElementById("map-container");
          if (mapElement) {
            const map = new window.google.maps.Map(mapElement, {
              center: { lat: latitude, lng: longitude },
              zoom: 15,
            });

            new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: map,
              title: "Detected Location",
            });
          } else {
            console.warn("Map container element not found.");
          }
          setMessage("Location detected successfully!");
          setLoading(false);
        } catch (error) {
          setMessage("Location detected but failed to fetch full address.");
          setLoading(false);
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
      const addressComponents = response.address_components;
      let address = response.formatted_address;
      let pincode = '';
      let city = '';
      let state = '';
      let landmark = '';

      addressComponents.forEach(component => {
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
        }
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
          landmark = component.long_name;
        }
      });

      // Update form data with detected location details
      setData((prev) => ({
        ...prev,
        address: address,
        pincode: pincode,
        city: city,
        state: state,
        landmark: landmark,
        location: `${city}, ${state}`,
      }));

    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to basic location setting
      setData((prev) => ({
        ...prev,
        location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
      }));
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
      setMessage("Please fill all required fields correctly.");
      return;
    }

    if (images.length === 0) {
      setMessage("Please upload at least one image.");
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

      await axios.post(`${API_URL}/api/rooms`, formData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      // Room added successfully
      setMessage("Room added successfully!");
      
      setTimeout(() => {
        navigate("/owner-dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error adding room:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to add room. Please try again.";
      setMessage(errorMessage);
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
            <Card.Header className="step-header">
              <i className="bi bi-house-door"></i>
              <h5>Basic Information</h5>
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
            <Card.Header className="step-header">
              <i className="bi bi-currency-rupee"></i>
              <h5>Pricing & Contact</h5>
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
            <Card.Header className="step-header">
              <i className="bi bi-geo-alt"></i>
              <h5>Location Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Button
                  variant="outline-primary"
                  onClick={handleUseCurrentLocation}
                  disabled={loading}
                  className="mb-3"
                >
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  Use Current Location
                </Button>

                {/* Map Section */}
                {showMap && mapsLoaded && data.latitude && data.longitude && (
                  <div className="mb-4">
                    <h6 className="mb-2">
                      <i className="bi bi-map me-2"></i>
                      Location on Map
                    </h6>
                    <div className="border rounded overflow-hidden">
                      <MapPicker
                        latitude={parseFloat(data.latitude)}
                        longitude={parseFloat(data.longitude)}
                        setLatLng={handleMapLocationChange}
                      />
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Click on the map to adjust the location pin
                    </small>
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
                      placeholder="Enter city"
                      isInvalid={!!errors.city}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.city}
                    </Form.Control.Feedback>
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
                  rows={2}
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
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
            <Card.Header className="step-header">
              <i className="bi bi-images"></i>
              <h5>Property Images</h5>
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

  return (
    <div className="add-room-container">
      {loading && <LoadingSpinner isLoading={loading} message="Adding your property..." />}
      <LoadGoogleMaps onLoad={() => setMapsLoaded(true)} />
      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-lg border-0">
              <div className="card-header text-white p-4 rounded-top-4" style={{background: '#6f42c1'}}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1 fw-bold">
                      <i className="bi bi-house-door me-2"></i>
                      Add New Property
                    </h2>
                    <p className="mb-0 opacity-75">List your property in 4 simple steps</p>
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
                                Adding Property...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Rentify
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
      <img src="/images/talking.png" alt="Talking Illustration" />
    </div>
  );
}

export default AddRoom;