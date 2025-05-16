import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;