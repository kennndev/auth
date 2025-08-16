import { lazy, Suspense } from 'react';
import { FlippableCardPreview } from './flippable-card-preview';

// Lazy load the 3D viewer component
const CardCase3DViewer = lazy(() => import('./CardCase3DViewerOptimized'));

interface CardPreviewWithCaseProps {
  cardFrontImage: string;
  cardBackImage: string;
  showCase: boolean;
}

// Loading placeholder that matches the 3D viewer dimensions
const LoadingPlaceholder = () => (
  <div className="relative w-full max-w-sm mx-auto font-mono">
    <div
      className="relative w-full bg-gray-100 animate-pulse rounded-lg"
      style={{
        aspectRatio: "2.5 / 3.5",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-500">Loading 3D preview...</div>
      </div>
    </div>
    <div className="text-center mt-4">
      <p className="text-xs text-gray-400 tracking-wide">Display case preview</p>
    </div>
  </div>
);

export default function CardPreviewWithCaseLazy({ 
  cardFrontImage, 
  cardBackImage, 
  showCase 
}: CardPreviewWithCaseProps) {
  return (
    <div className="relative w-full">
      {showCase ? (
        <div className="w-full">
          <Suspense fallback={<LoadingPlaceholder />}>
            <CardCase3DViewer 
              cardFrontImage={cardFrontImage} 
              cardBackImage={cardBackImage} 
            />
          </Suspense>
        </div>
      ) : (
        <div className="w-full">
          <FlippableCardPreview 
            artwork={cardFrontImage} 
          />
        </div>
      )}
    </div>
  );
}