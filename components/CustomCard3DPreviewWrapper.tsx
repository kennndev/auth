"use client"

import dynamic from "next/dynamic"

// Lazy load the completely independent CustomCardPreviewWithCase component
const CustomCardPreviewWithCase = dynamic(() => import("./CustomCardPreviewWithCase"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-cyber-purple animate-pulse">Loading custom 3D preview...</div>
    </div>
  ),
})

interface CustomCard3DPreviewWrapperProps {
  cardFrontImage: string
  cardBackImage: string
  showCase?: boolean
  caseModelPath?: string
  animationKey?: number
}

export default function CustomCard3DPreviewWrapper({
  cardFrontImage,
  cardBackImage,
  showCase = true,
  caseModelPath = "/card-slab-3d-custom.glb",
  animationKey = 0
}: CustomCard3DPreviewWrapperProps) {
  return (
    <div className="custom-card-3d-wrapper w-full h-full" key={animationKey}>
      <CustomCardPreviewWithCase
        cardFrontImage={cardFrontImage}
        cardBackImage={cardBackImage}
        showCase={showCase}
        caseModelPath={caseModelPath}
      />
    </div>
  )
}