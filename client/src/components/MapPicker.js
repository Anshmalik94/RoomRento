import { useEffect, useRef } from "react";
import './MapPicker.css';

function MapPicker({ setLatLng, latitude, longitude, onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // MapPicker useEffect triggered
    
    // Check if Google Maps is available
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      return;
    }

    try {
      // Creating map with coordinates
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude || 20.5937, lng: longitude || 78.9629 },
        zoom: latitude && longitude ? 15 : 5,
        // Disable default controls
        disableDefaultUI: true,
        // Enable only essential controls
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        // Keep gesture handling for user interaction
        gestureHandling: 'cooperative'
      });

      if (latitude && longitude) {
        // Adding marker
        markerRef.current = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
        });
      }

      const handleMapClick = (e) => {
        const clickedLatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        // Map clicked
        
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        
        markerRef.current = new window.google.maps.Marker({
          position: clickedLatLng,
          map: map,
        });
        
        if (setLatLng) setLatLng(clickedLatLng);
        if (onLocationSelect) onLocationSelect(clickedLatLng);
      };

      map.addListener("click", handleMapClick);

      return () => {
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearListeners(map, "click");
        }
      };
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
    }
  }, [latitude, longitude, setLatLng, onLocationSelect]);

  return (
    <div
      ref={mapRef}
      style={{ 
        height: "300px", 
        width: "100%", 
        marginTop: "10px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #dee2e6",
        borderRadius: "0.375rem"
      }}
    >
      {(!window.google || !window.google.maps) && (
        <div className="text-muted text-center">
          <i className="bi bi-geo-alt" style={{ fontSize: "2rem", color: "#6f42c1" }}></i>
          <p className="mb-0 mt-2">Loading Google Maps...</p>
          <small>Lat: {latitude || 'N/A'}, Lng: {longitude || 'N/A'}</small>
          <br />
          <small>API Available: {window.google ? 'Yes' : 'No'}</small>
        </div>
      )}
    </div>
  );
}

export default MapPicker;
