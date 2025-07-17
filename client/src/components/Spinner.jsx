import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

const Spinner = ({ 
  size = 'border', 
  variant = 'primary', 
  text = 'Loading...', 
  center = true,
  overlay = false,
  className = ''
}) => {
  const spinnerContent = (
    <div className={`d-flex align-items-center ${center ? 'justify-content-center' : ''} ${className}`}>
      <BootstrapSpinner 
        animation={size} 
        variant={variant} 
        size={size === 'grow' ? 'sm' : undefined}
        className="me-2"
      />
      {text && <span className="text-muted">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          zIndex: 9999,
          backdropFilter: 'blur(2px)'
        }}
      >
        <div className="text-center p-4 bg-white rounded shadow">
          {spinnerContent}
        </div>
      </div>
    );
  }

  if (center) {
    return (
      <div className="text-center py-4 py-md-5">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Page-level loading spinner
export const PageSpinner = ({ text = 'Loading page...' }) => (
  <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
    <div className="text-center">
      <BootstrapSpinner animation="border" variant="primary" className="mb-3" />
      <h5 className="text-muted">{text}</h5>
    </div>
  </div>
);

// Button spinner for form submissions
export const ButtonSpinner = ({ size = 'sm', className = 'me-2' }) => (
  <BootstrapSpinner 
    animation="border" 
    size={size} 
    className={className}
  />
);

// Card loading skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="col-12 col-sm-6 col-lg-4 mb-4">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
            <BootstrapSpinner animation="border" variant="secondary" />
          </div>
          <div className="card-body">
            <div className="placeholder-glow">
              <span className="placeholder col-8 bg-secondary mb-2 d-block"></span>
              <span className="placeholder col-6 bg-secondary mb-2 d-block"></span>
              <span className="placeholder col-4 bg-secondary"></span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

export default Spinner;
