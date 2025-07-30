import React, { useEffect, useRef, useState } from 'react';

function SimpleMapPicker({ setLatLng, latitude, longitude, onLocationSelect }) {
  const mapDivRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasInit = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasInit.current) return;
    hasInit.current = true;

    let mounted = true;

    const initMap = async () => {
      try {
        console.log('🗺️ SimpleMapPicker: Starting...');
        
        // Wait a bit for DOM
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!mounted || !mapDivRef.current) return;

        // Load Google Maps
        await loadGoogleMaps();
        
        if (!mounted) return;

        console.log('🗺️ Creating map...');
        
        const lat = parseFloat(latitude) || 28.6139;
        const lng = parseFloat(longitude) || 77.2090;

        // Create map
        const map = new window.google.maps.Map(mapDivRef.current, {
          center: { lat, lng },
          zoom: 15,
          disableDefaultUI: false
        });

        // Create marker
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
          title: "Drag or click map to select location"
        });

        // Map click handler
        map.addListener('click', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          
          marker.setPosition({ lat: newLat, lng: newLng });
          
          if (setLatLng) setLatLng({ lat: newLat, lng: newLng });
          if (onLocationSelect) onLocationSelect('Selected', newLat, newLng);
        });

        // Marker drag handler
        marker.addListener('dragend', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          
          if (setLatLng) setLatLng({ lat: newLat, lng: newLng });
          if (onLocationSelect) onLocationSelect('Dragged', newLat, newLng);
        });

        console.log('✅ Map created successfully');
        setIsLoading(false);
        setError(null);

      } catch (err) {
        console.error('❌ Map error:', err);
        if (mounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      // NO cleanup - let React handle it
    };
  }, []); // Empty deps

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk&libraries=places';
      script.async = true;
      
      script.onload = () => {
        if (window.google?.maps) {
          resolve();
        } else {
          setTimeout(() => {
            if (window.google?.maps) resolve();
            else reject(new Error('Maps API not ready'));
          }, 1000);
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Maps'));
      document.head.appendChild(script);
    });
  };

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c33'
      }}>
        <strong>Map Error:</strong> {error}
        <br />
        <small>Your location is still saved.</small>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-primary mb-2">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>Loading map...</div>
          </div>
        </div>
      )}
      
      <div
        ref={mapDivRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
      
      {!isLoading && !error && (
        <div style={{ 
          marginTop: '8px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          🖱️ Click on map or drag marker to select location
        </div>
      )}
    </div>
  );
}

export default SimpleMapPicker;
