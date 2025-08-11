// Pure JavaScript utility for loading Google Maps - NO REACT COMPONENT
// This avoids React's DOM management and prevents removeChild errors

let googleMapsPromise = null;

const loadGoogleMapsScript = () => {
  // Return existing promise if already initiated
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if Google Maps is already available
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }
  // Create a single promise for the entire application
  googleMapsPromise = new Promise((resolve, reject) => {
    // Double check after promise creation
    if (window.google && window.google.maps && window.google.maps.Map) {
      resolve();
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script exists, poll for Google Maps availability
      let pollCount = 0;
      const maxPolls = 100; // 10 seconds max
      
      const pollInterval = setInterval(() => {
        pollCount++;
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(pollInterval);
          resolve();
        } else if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          console.error('⏰ Google Maps loading timeout via existing script');
          reject(new Error('Google Maps loading timeout'));
        }
      }, 100);
      return;
    }

    // Create script element with production environment check
    const script = document.createElement('script');
    
    // Production API key check
    let apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Fallback for production if env var is missing
    if (!apiKey) {
      console.warn('⚠️ REACT_APP_GOOGLE_MAPS_API_KEY not found in environment variables');
      apiKey = "AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk"; // fallback key
    }
    
    console.log('🗺️ Loading Google Maps with key:', apiKey.substring(0, 10) + '...');
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,geocoding&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Add global callback for more reliable loading
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps API loaded successfully');
      resolve();
    };

    script.onload = () => {
      // Wait a bit for Google Maps to fully initialize
      let initCount = 0;
      const maxInits = 50; // 5 seconds max
      
      const initInterval = setInterval(() => {
        initCount++;
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(initInterval);
          resolve();
        } else if (initCount >= maxInits) {
          clearInterval(initInterval);
          console.error('❌ Google Maps failed to initialize after loading');
          reject(new Error('Google Maps failed to initialize'));
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps API script:', error);
      console.error('🔗 Script URL:', script.src);
      reject(new Error(`Google Maps script loading failed: ${error.message || 'Unknown error'}`));
    };

    // Add script to head (do this only once)
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// NO REACT COMPONENT - just export the utility function
export { loadGoogleMapsScript };
export default loadGoogleMapsScript;
