import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's the specific DOM removeChild error we're trying to catch
    if (error.message && error.message.includes('removeChild')) {
    }
    
    // Check if it's a Google Maps API error
    if (error.message && (error.message.includes('Google Maps') || error.message.includes('maps'))) {
    }
  }

  handleRetry = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null });
    
    // Force a reload of the Google Maps script if needed
    if (this.props.component === 'map') {
      // Remove existing Google Maps script to force reload
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Clear any cached promises
      if (window.loadGoogleMapsScript) {
        window.googleMapsPromise = null;
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI for map components
      if (this.props.component === 'map') {
        return (
          <div style={{ 
            height: "350px", 
            width: "100%", 
            marginTop: "10px",
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #e9ecef",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <div className="text-center p-4">
              <i className="bi bi-exclamation-triangle text-warning mb-3" style={{ fontSize: '2.5rem' }}></i>
              <h6 className="text-warning mb-2">Map Component Error</h6>
              <p className="mb-2 text-muted small">
                The map experienced a technical issue but your data is safe.
              </p>
              <p className="mb-3 text-muted small">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={this.handleRetry}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry Map
              </button>
            </div>
          </div>
        );
      }

      // Generic fallback UI
      return (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Something went wrong.</strong> 
          <button 
            className="btn btn-sm btn-outline-warning ms-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
