import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  isLoading, 
  message = "Loading, please wait...", 
  inline = false,
  size = "medium",
  showMessage = true 
}) => {
  if (!isLoading) return null;

  // Inline spinner for buttons and specific locations
  if (inline) {
    return (
      <div className="inline-spinner-container">
        <span className={`inline-loader ${size}`}></span>
        {showMessage && message && (
          <span className="inline-loading-text">{message}</span>
        )}
      </div>
    );
  }

  // Full overlay spinner (transparent background)
  return (
    <div className="loading-overlay-transparent">
      <div className="loading-content-center">
        <div className="spinner-container">
          <span className="loader"></span>
        </div>
        {showMessage && <p className="loading-text">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
