import { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import LoadingSpinner from '../components/elements/LoadingSpinner';

// Type untuk komponen React
type ReactComponent = ComponentType<any>;

// Type untuk fungsi yang mengembalikan promise dari komponen
type ImportFunc = () => Promise<{ default: ReactComponent }>;

/**
 * Higher-Order Function untuk lazy loading komponen dengan Suspense
 * @param importFunc Fungsi import () => import('./path')
 * @returns JSX.Element dengan Suspense wrapper
 */
export const lazyLoad = (importFunc: ImportFunc): JSX.Element => {
  const LazyComponent: LazyExoticComponent<ReactComponent> = lazy(importFunc);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};

// Versi alternatif untuk menangkap error
export const lazyLoadWithErrorBoundary = (importFunc: ImportFunc, ErrorFallback?: ReactComponent): JSX.Element => {
  const LazyComponent = lazy(importFunc);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {ErrorFallback ? (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <LazyComponent />
        </ErrorBoundary>
      ) : (
        <LazyComponent />
      )}
    </Suspense>
  );
};