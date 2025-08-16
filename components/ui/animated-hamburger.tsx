"use client"

import { cn } from "@/lib/utils"

interface AnimatedHamburgerProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function AnimatedHamburger({ isOpen, onClick, className }: AnimatedHamburgerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative h-8 w-8 flex flex-col items-center justify-center md:hidden",
        "text-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/5 rounded-md transition-colors",
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span
        className={cn(
          "absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out",
          isOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"
        )}
      />
      <span
        className={cn(
          "absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out",
          isOpen ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        className={cn(
          "absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out",
          isOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"
        )}
      />
    </button>
  )
}