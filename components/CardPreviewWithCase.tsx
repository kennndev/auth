import { FlippableCardPreview } from './flippable-card-preview';
import CardCase3DViewer from './CardCase3DViewerOptimized';

interface CardPreviewWithCaseProps {
  cardFrontImage: string;
  cardBackImage: string;
  showCase: boolean;
}

export default function CardPreviewWithCase({ 
  cardFrontImage, 
  cardBackImage, 
  showCase 
}: CardPreviewWithCaseProps) {
  return (
    <div className="relative w-full">
      {showCase ? (
        <div className="w-full">
          <CardCase3DViewer 
            cardFrontImage={cardFrontImage} 
            cardBackImage={cardBackImage} 
          />
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