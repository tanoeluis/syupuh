import React from 'react';
import { useRouteError } from 'react-router-dom';

interface ErrorBoundaryProps {
  FallbackComponent?: React.ComponentType<{ error: Error }>;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ FallbackComponent }) => {
  const error = useRouteError() as Error;
  
  if (FallbackComponent) {
    return <FallbackComponent error={error} />;
  }

  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );
};

export default ErrorBoundary;