'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
export const LazyLimitedEditionModal = lazy(() => 
  import('./limited-edition-modal').then(module => ({ 
    default: module.LimitedEditionModal 
  }))
);

export const LazyCardCase3DViewer = lazy(() => 
  import('./CardCase3DViewerOptimized')
);

export const LazyCardPreviewWithCase = lazy(() => 
  import('./CardPreviewWithCaseLazy')
);

// Loading components
const ModalLoader = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-900 rounded-lg p-8 flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      <p className="text-white font-mono">Loading experience...</p>
    </div>
  </div>
);

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
  </div>
);

// Wrapper components with loading states
export const LimitedEditionModalWithSuspense = ({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) => (
  <Suspense fallback={isOpen ? <ModalLoader /> : null}>
    <LazyLimitedEditionModal isOpen={isOpen} onClose={onClose} />
  </Suspense>
);

export const CardCase3DViewerWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<ComponentLoader />}>
    <LazyCardCase3DViewer {...props} />
  </Suspense>
);

export const CardPreviewWithCaseWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<ComponentLoader />}>
    <LazyCardPreviewWithCase {...props} />
  </Suspense>
);

// Higher-order component for lazy loading with performance tracking
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType,
  displayName?: string
) {
  const LazyComponent = lazy(importFn);
  LazyComponent.displayName = displayName || 'LazyComponent';
  
  const WrappedComponent = (props: P) => {
    const LoadingFallback = fallback || ComponentLoader;
    
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
  
  WrappedComponent.displayName = `WithLazyLoading(${displayName || 'Component'})`;
  
  return WrappedComponent;
}

// Preload function for critical components
export function preloadCriticalComponents() {
  // Preload components that will likely be needed
  import('./limited-edition-modal');
  import('./CardCase3DViewerOptimized');
  import('./CardPreviewWithCaseLazy');
}

// Preload on user interaction (hover, focus, etc.)
export function preloadOnInteraction(componentName: string) {
  const preloadMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
    'limited-edition-modal': () => import('./limited-edition-modal'),
    'card-case-3d': () => import('./CardCase3DViewerOptimized'),
    'card-preview': () => import('./CardPreviewWithCaseLazy'),
  };
  
  const preloadFn = preloadMap[componentName];
  if (preloadFn) {
    preloadFn().catch(error => {
      console.warn(`Failed to preload ${componentName}:`, error);
    });
  }
}