"use client"

import { useState } from "react"

interface FlippableCardPreviewProps {
  artwork: string | null
}

export function FlippableCardPreview({ artwork }: FlippableCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window

  return (
    <div className="relative w-full max-w-sm mx-auto font-mono">
      {/* Card Container with 3D flip effect - Standard playing card ratio 2.5:3.5 */}
      <div
        className="relative w-full cursor-pointer"
        style={{
          perspective: "1000px",
          aspectRatio: "2.5 / 3.5",
          maxWidth: "100%",
        }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="relative w-full h-full rounded-2xl border-2 border-cyber-cyan/50 shadow-2xl cyber-card-glow-gradient overflow-hidden">
              {/* Front Label - only show when no artwork is uploaded */}
              {!artwork && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-cyber-cyan/20 border border-cyber-cyan/50 rounded text-xs text-cyber-cyan font-bold tracking-wider z-10">
                  FRONT
                </div>
              )}

              {/* User's artwork fills the entire card */}
              {artwork ? (
                <img
                  src={artwork || "/placeholder.svg"}
                  alt="Card artwork"
                  className="w-full h-full object-fill rounded-xl"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    imageRendering: 'crisp-edges'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-cyber-dark to-cyber-darker rounded-xl">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-cyber-cyan/20 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-cyber-cyan/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                    </div>
                    <span className="text-sm text-cyber-cyan/50 tracking-wide">Upload artwork to preview</span>
                  </div>
                </div>
              )}

              {/* Holographic effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 via-transparent to-cyber-pink/10 opacity-30 rounded-2xl" />

              {/* Scanlines - disabled on mobile for performance */}
              {!isMobile && <div className="absolute inset-0 scanlines opacity-20 rounded-2xl" />}

              {/* Corner accents - only visible when no artwork is loaded */}
              {!artwork && (
                <>
                  <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyber-cyan"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyber-cyan"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-cyan"></div>
                </>
              )}
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="relative w-full h-full rounded-2xl border-2 border-cyber-pink/50 shadow-2xl cyber-card-glow-gradient overflow-hidden">
              {/* Holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/5 via-cyber-purple/5 to-cyber-cyan/5 rounded-2xl z-10" />

              {/* Scanlines - disabled on mobile for performance */}
              {!isMobile && <div className="absolute inset-0 scanlines opacity-20 rounded-2xl z-10" />}

              {/* Back Label */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-xs text-cyber-pink font-bold tracking-wider z-10">
                BACK
              </div>

              {/* Static image for the back of the card */}
              <img
                src="/redbackbleed111111.jpg"
                alt="Limited Edition Card Back"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
              {/* Removed corner accents from the back of the card */}
            </div>
          </div>
        </div>
      </div>

      {/* Flip Instruction */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-400 tracking-wide">{isFlipped ? "Showing card back" : "Hover to flip card"}</p>
      </div>
    </div>
  )
}
