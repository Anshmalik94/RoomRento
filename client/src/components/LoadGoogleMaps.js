import { useEffect } from "react";

function LoadGoogleMaps({ onLoad }) {
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk";

    if (!apiKey || apiKey.includes("%REACT_APP_GOOGLE_MAPS_API_KEY%")) {
      console.error("❌ Google Maps API Key missing or not replaced properly!");
      // Call onLoad anyway to prevent blocking the app
      if (onLoad) onLoad();
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      if (onLoad) onLoad();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkInterval);
            if (onLoad) onLoad();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn("Google Maps loading timeout, continuing without maps");
          if (onLoad) onLoad();
        }, 10000);
      });
      return;
    }

    // Create new script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkInterval);
          if (onLoad) onLoad();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn("Google Maps loading timeout, continuing without maps");
        if (onLoad) onLoad();
      }, 10000);
    };
    
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      if (onLoad) onLoad();
    };
    
    document.body.appendChild(script);
  }, [onLoad]);

  return null;
}

export default LoadGoogleMaps;
