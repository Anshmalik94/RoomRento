// Pure JavaScript utility for loading Google Maps - NO REACT COMPONENT
// This avoids React's DOM management and prevents removeChild errors

let googleMapsPromise = null;

const loadGoogleMapsScript = () => {
  // Return existing promise if already initiated
  if (googleMapsPromise) {
    console.log('🔄 Returning existing Google Maps promise');
    return googleMapsPromise;
  }

  // Check if Google Maps is already available
  if (window.google && window.google.maps && window.google.maps.Map) {
    console.log('✅ Google Maps already available');
    return Promise.resolve();
  }

  console.log('🚀 Starting Google Maps API loading...');
  
  // Create a single promise for the entire application
  googleMapsPromise = new Promise((resolve, reject) => {
    // Double check after promise creation
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log('✅ Google Maps available after promise creation');
      resolve();
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('📜 Google Maps script already exists, waiting for load...');
      // Script exists, poll for Google Maps availability
      let pollCount = 0;
      const maxPolls = 100; // 10 seconds max
      
      const pollInterval = setInterval(() => {
        pollCount++;
        console.log(`🔍 Polling for Google Maps... (${pollCount}/${maxPolls})`);
        
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('✅ Google Maps loaded via existing script');
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

    // Create script element
    console.log('📝 Creating new Google Maps script element...');
    const script = document.createElement('script');
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyADOYPe7t0IbbRuvzmNDbcYHOb98_cCTQk";
    
    console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,geocoding`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('📥 Google Maps script loaded, waiting for initialization...');
      // Wait a bit for Google Maps to fully initialize
      let initCount = 0;
      const maxInits = 50; // 5 seconds max
      
      const initInterval = setInterval(() => {
        initCount++;
        console.log(`⚙️ Checking Google Maps initialization... (${initCount}/${maxInits})`);
        
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(initInterval);
          console.log('✅ Google Maps API loaded and initialized successfully');
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
    console.log('➕ Adding Google Maps script to document head');
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// NO REACT COMPONENT - just export the utility function
export { loadGoogleMapsScript };
export default loadGoogleMapsScript;
