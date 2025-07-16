import { useEffect, useRef } from "react";

function MapPicker({ setLatLng, latitude, longitude, onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    console.log("MapPicker useEffect triggered", {
      hasGoogle: !!window.google,
      hasGoogleMaps: !!(window.google && window.google.maps),
      hasMap: !!(window.google && window.google.maps && window.google.maps.Map),
      latitude,
      longitude
    });
    
    // Check if Google Maps is available
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.warn("Google Maps not available, showing placeholder");
      return;
    }

    try {
      console.log("Creating map with coordinates:", { latitude, longitude });
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude || 20.5937, lng: longitude || 78.9629 },
        zoom: latitude && longitude ? 15 : 5,
      });

      if (latitude && longitude) {
        console.log("Adding marker at:", { lat: latitude, lng: longitude });
        markerRef.current = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
        });
      }

      const handleMapClick = (e) => {
        const clickedLatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        console.log("Map clicked at:", clickedLatLng);
        
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
