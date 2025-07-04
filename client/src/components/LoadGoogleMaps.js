import { useEffect } from "react";

function LoadGoogleMaps({ onLoad }) {
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk";

    if (!apiKey || apiKey.includes("%REACT_APP_GOOGLE_MAPS_API_KEY%")) {
      console.error("❌ Google Maps API Key missing or not replaced properly!");
      return;
    }

    if (window.google && window.google.maps) {
      onLoad();
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            onLoad();
          }
        }, 100);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true; // Recommended for performance
    script.onload = () => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          onLoad();
        }
      }, 100);
    };
    document.body.appendChild(script);
  }, [onLoad]);

  return null;
}

export default LoadGoogleMaps;
