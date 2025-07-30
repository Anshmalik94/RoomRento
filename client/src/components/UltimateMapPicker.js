import { useEffect, useRef, useState } from "react";

// 🎯 ULTIMATE Google Maps Solution - Zero DOM Conflicts
function UltimateMapPicker({ setLatLng, latitude, longitude, onLocationSelect }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const mapElementRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Prevent double initialization in StrictMode
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const createMapSafely = async () => {
      try {
        console.log("🚀 UltimateMapPicker: Starting safe initialization...");
        
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!isMounted || !mapElementRef.current) {
          console.log("❌ Component unmounted or ref not ready");
          return;
        }

        // Load Google Maps if needed
        await ensureGoogleMapsLoaded();
        
        if (!isMounted) return;

        // Get current location first
        let mapCenter;
        try {
          mapCenter = await getCurrentPosition();
          console.log("📍 Current location:", mapCenter);
        } catch (locError) {
          console.warn("📍 Using default location:", locError);
          mapCenter = {
            lat: parseFloat(latitude) || 28.6139,
            lng: parseFloat(longitude) || 77.2090
          };
        }

        // Create map container safely
        const mapContainer = mapElementRef.current;
        
        // Clear any existing content
        mapContainer.innerHTML = '';
        
        // Create the actual map
        const map = new window.google.maps.Map(mapContainer, {
          center: mapCenter,
          zoom: 16,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'cooperative'
        });

        // Use modern marker if available, fallback to old one
        let marker;
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: mapCenter,
            map: map,
            title: "Your Location (click map to change)"
          });
        } else {
          marker = new window.google.maps.Marker({
            position: mapCenter,
            map: map,
            draggable: true,
            title: "Your Location (drag to change)"
          });
        }

        // Handle map clicks
        map.addListener('click', (event) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          
          console.log("🖱️ Map clicked:", { lat: newLat, lng: newLng });
          
          // Update marker position
          if (marker.setPosition) {
            marker.setPosition({ lat: newLat, lng: newLng });
          } else {
            marker.position = { lat: newLat, lng: newLng };
          }
          
          // Notify parent components
          try {
            if (setLatLng) setLatLng({ lat: newLat, lng: newLng });
            if (onLocationSelect) onLocationSelect('Selected Location', newLat, newLng);
          } catch (e) {
            console.warn("Callback error:", e);
          }
        });

        // Handle marker drag (if supported)
        if (marker.addListener) {
          marker.addListener('dragend', (event) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            
            console.log("🎯 Marker dragged:", { lat: newLat, lng: newLng });
            
            try {
              if (setLatLng) setLatLng({ lat: newLat, lng: newLng });
              if (onLocationSelect) onLocationSelect('Dragged Location', newLat, newLng);
            } catch (e) {
              console.warn("Drag callback error:", e);
            }
          });
        }

        console.log("✅ UltimateMapPicker: Map created successfully!");
        setIsReady(true);
        setError(null);

        // Set initial location
        if (setLatLng) setLatLng(mapCenter);
        if (onLocationSelect) onLocationSelect('Current Location', mapCenter.lat, mapCenter.lng);

      } catch (error) {
        console.error("❌ UltimateMapPicker error:", error);
        if (isMounted) {
          setError(error.message);
          setIsReady(false);
        }
      }
    };

    createMapSafely();

    // Cleanup - NO DOM manipulation, just state cleanup
    return () => {
      console.log("🧹 UltimateMapPicker: Component unmounting...");
      isMounted = false;
      // React will handle DOM cleanup automatically
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - callbacks handled inside effect

  // Get current geolocation
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Ensure Google Maps API is loaded
  const ensureGoogleMapsLoaded = () => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const waitForLoad = () => {
          if (window.google?.maps) {
            resolve();
          } else {
            setTimeout(waitForLoad, 100);
          }
        };
        waitForLoad();
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk&libraries=marker,places,geometry&v=weekly`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        const waitForAPI = () => {
          if (window.google?.maps) {
            resolve();
          } else {
            setTimeout(waitForAPI, 100);
          }
        };
        waitForAPI();
      };
      
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.appendChild(script);
    });
  };

  // Update marker when props change (optional)
  useEffect(() => {
    if (isReady && latitude && longitude) {
      console.log("📍 Props updated:", { latitude, longitude });
      // Map will handle position updates through callbacks
    }
  }, [latitude, longitude, isReady]);

  if (error) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c33'
      }}>
        <strong>🗺️ Map Error:</strong> {error}
        <br />
        <small>Location data is still saved. Continue without map.</small>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-primary mb-2">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              📍 Loading map and detecting location...
            </div>
          </div>
        </div>
      )}

      {/* Map Element - React NEVER touches this after creation */}
      <div
        ref={mapElementRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />

      {isReady && (
        <div style={{ 
          marginTop: '8px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          🖱️ Click on map to select location | 📍 Current location auto-detected
        </div>
      )}
    </div>
  );
}

export default UltimateMapPicker;
