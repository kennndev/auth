"use client"

interface PromptSuggestionChipProps {
  prompt: string
  onClick: () => void
  isSelected: boolean
}

export function PromptSuggestionChip({ prompt, onClick, isSelected }: PromptSuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap
                  ${
                    isSelected
                      ? "bg-cyber-purple text-white border-cyber-purple shadow-md shadow-cyber-purple/30"
                      : "bg-cyber-darker/60 text-gray-300 border-cyber-purple/50 hover:bg-cyber-purple/20 hover:text-cyber-purple hover:border-cyber-purple/70"
                  }`}
    >
      {prompt}
    </button>
  )
}
