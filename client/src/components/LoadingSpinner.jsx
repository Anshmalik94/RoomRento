import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ isLoading, message = "Loading, please wait..." }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-container">
          <span className="loader"></span>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
