interface CardPreviewProps {
  title: string
  description: string
  artwork: string
  frame: string
  stats: {
    attack: string
    defense: string
    health: string
  }
}

export function CardPreview({ artwork }: CardPreviewProps) {
  return (
    <div className="relative w-full max-w-sm mx-auto font-mono">
      {/* Card Container with Cyberpunk Border and Animated Glow - Trading card proportions */}
      <div className="relative bg-gradient-to-br from-cyber-dark via-cyber-darker to-cyber-black rounded-xl p-4 border-2 border-cyber-cyan/50 shadow-2xl cyber-card-glow-gradient aspect-[5/7]">
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 via-cyber-pink/5 to-cyber-purple/5 rounded-xl" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-20 rounded-xl" />

        {/* Card Content */}
        <div className="relative z-10 h-full">
          {/* Artwork - Fill the available card space */}
          <div className="w-full h-full bg-cyber-darker rounded-lg overflow-hidden border-2 border-cyber-pink/30 relative">
            {artwork ? (
              <img src={artwork || "/placeholder.svg"} alt="Card artwork" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-cyber-dark to-cyber-darker">
                <span className="text-sm text-cyber-cyan/50 tracking-wide">No artwork selected</span>
              </div>
            )}
            {/* Holographic effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 via-transparent to-cyber-pink/10 opacity-30" />
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyber-cyan"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyber-cyan"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-cyan"></div>
      </div>
    </div>
  )
}
