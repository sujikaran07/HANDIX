import React from 'react';

// Reusable loading spinner component with customizable size and color
const Spinner = ({ size = 'md', color = 'primary', message }) => {
  const spinnerSizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border spinner-border-lg'
  };
  
  const sizeClass = spinnerSizeClasses[size] || '';
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center my-3">
      <div 
        className={`spinner-border text-${color} ${sizeClass}`} 
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default Spinner;
