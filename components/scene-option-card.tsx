"use client"

import type React from "react"

import { Wand2 } from "lucide-react"

interface Scene {
  id: string
  name: string
  imageQuery: string
  icon: React.ElementType
}

interface SceneOptionCardProps {
  scene: Scene
  isSelected: boolean
  onSelect: () => void
}

export function SceneOptionCard({ scene, isSelected, onSelect }: SceneOptionCardProps) {
  const Icon = scene.icon || Wand2
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 group aspect-[3/4]
                  ${isSelected ? "border-cyber-pink shadow-xl shadow-cyber-pink/30 scale-105" : "border-cyber-pink/40 hover:border-cyber-pink/70 hover:scale-102"}`}
    >
      <img
        src={`/placeholder.svg?height=200&width=150&query=${encodeURIComponent(scene.imageQuery)}`}
        alt={scene.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 via-cyber-black/40 to-transparent" />
      {isSelected && (
        <div className="absolute inset-0 border-4 border-cyber-pink rounded-md pointer-events-none animate-pulse opacity-50" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <h4
          className={`text-xs font-semibold tracking-wider transition-colors ${isSelected ? "text-cyber-pink" : "text-white group-hover:text-cyber-pink/90"}`}
        >
          {scene.name}
        </h4>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-cyber-pink text-cyber-black p-1 rounded-full shadow-md">
          <Icon size={12} />
        </div>
      )}
    </div>
  )
}
