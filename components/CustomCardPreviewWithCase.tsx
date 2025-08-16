import CustomCardCase3DViewer from './CustomCardCase3DViewer';

interface CustomCardPreviewWithCaseProps {
  cardFrontImage: string;
  cardBackImage: string;
  showCase: boolean;
  caseModelPath?: string;
}

// Completely independent preview component for custom cards
export default function CustomCardPreviewWithCase({ 
  cardFrontImage, 
  cardBackImage, 
  showCase,
  caseModelPath = '/card-slab-3d-custom.glb'
}: CustomCardPreviewWithCaseProps) {
  if (!showCase) {
    // Simple 2D preview for custom cards when case is not shown
    return (
      <div className="relative w-full aspect-[2.5/3.5] max-w-sm mx-auto">
        <img 
          src={cardFrontImage} 
          alt="Custom Card Preview" 
          className="w-full h-full object-cover rounded-xl border-2 border-cyber-purple/50"
        />
      </div>
    );
  }

  return (
    <div className="custom-card-preview-container relative w-full">
      <CustomCardCase3DViewer 
        cardFrontImage={cardFrontImage} 
        cardBackImage={cardBackImage}
        modelPath={caseModelPath}
      />
    </div>
  );
}