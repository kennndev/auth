"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Package, Coins, Layers, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

type CardPath = "physical" | "nft" | "hybrid" | null

export default function CardPathPage() {
  const [selectedPath, setSelectedPath] = useState<CardPath>(null)

  const pathOptions = [
    {
      id: "physical" as const,
      title: "Physical Card Only",
      description: "High-quality printed card with holographic effects",
      icon: Package,
      color: "cyber-green",
      features: ["Premium card stock", "Holographic finish", "Worldwide shipping", "Collector quality"],
    },
    {
      id: "nft" as const,
      title: "NFT Card Only",
      description: "Digital collectible on the blockchain",
      icon: Coins,
      color: "cyber-cyan",
      features: ["Blockchain verified", "Tradeable asset", "Digital ownership", "Metaverse ready"],
    },
    {
      id: "hybrid" as const,
      title: "Physical + NFT Hybrid",
      description: "Best of both worlds - physical and digital",
      icon: Layers,
      color: "cyber-pink",
      features: ["Physical card", "NFT companion", "Dual ownership", "Maximum value"],
    },
  ]

  const getPathStyles = (pathId: CardPath, color: string) => {
    const isSelected = selectedPath === pathId
    const baseStyles = "group relative overflow-hidden transition-all duration-300 cursor-pointer border-2"

    if (isSelected) {
      return `${baseStyles} bg-${color}/20 border-${color} shadow-2xl shadow-${color}/30`
    }

    return `${baseStyles} bg-cyber-dark/60 border-${color}/30 hover:border-${color}/60 hover:bg-${color}/10 hover:shadow-lg hover:shadow-${color}/20`
  }

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      {/* Animated floating orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-cyber-cyan rounded-full blur-3xl opacity-8 animate-glow-cyan" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-cyber-pink rounded-full blur-3xl opacity-6 animate-glow-pink" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyber-purple rounded-full blur-3xl opacity-4 animate-glow-purple" />
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-cyber-green rounded-full blur-3xl opacity-7 animate-glow-green" />
      <div className="absolute bottom-40 right-10 w-72 h-72 bg-cyber-blue rounded-full blur-3xl opacity-5 animate-glow-blue" />

      <Navigation />

      <div className="px-4 sm:px-6 py-8 pt-24 relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
              Choose Your <span className="holographic">Card Path</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Select how you&apos;d like to bring your card to life</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Center - Selection Options */}
            <div className="">
              {/* Selection Container */}
              <Card className="bg-cyber-dark/80 backdrop-blur-md border-2 border-cyber-cyan/40 rounded-3xl p-4 sm:p-8 shadow-2xl cyber-card-glow-gradient">
                <CardContent className="p-0">
                  <div className="grid gap-6">
                    {pathOptions.map((option) => {
                      const IconComponent = option.icon
                      const isSelected = selectedPath === option.id

                      return (
                        <Card
                          key={option.id}
                          className={getPathStyles(option.id, option.color)}
                          onClick={() => setSelectedPath(option.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                              {/* Icon */}
                              <div
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? `bg-${option.color}/30 shadow-lg shadow-${option.color}/20`
                                    : `bg-${option.color}/20 ${!isSelected ? `group-hover:bg-${option.color}/30` : ""}`
                                }`}
                              >
                                <IconComponent
                                  className={`w-6 h-6 sm:w-8 sm:h-8 text-${option.color} ${isSelected ? "animate-pulse" : ""}`}
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-3">
                                <div>
                                  <h3
                                    className={`text-lg sm:text-xl font-bold tracking-wider transition-colors ${
                                      isSelected
                                        ? `text-${option.color}`
                                        : `text-white ${!isSelected ? "group-hover:text-white" : ""}`
                                    }`}
                                  >
                                    {option.title}
                                  </h3>
                                  <p className="text-gray-400 text-sm mt-1 tracking-wide">{option.description}</p>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {option.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full bg-${option.color}/60`} />
                                      <span className="text-xs text-gray-300 tracking-wide">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Selection Indicator */}
                              <div
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                                  isSelected
                                    ? `border-${option.color} bg-${option.color}/20 shadow-lg shadow-${option.color}/30`
                                    : `border-gray-500 ${!isSelected ? `group-hover:border-${option.color}/60` : ""}`
                                }`}
                              >
                                {isSelected && (
                                  <div className={`w-full h-full rounded-full bg-${option.color} animate-pulse`} />
                                )}
                              </div>
                            </div>

                            {/* Selected glow effect */}
                            {isSelected && (
                              <div className="absolute inset-0 rounded-lg pointer-events-none">
                                <div
                                  className={`absolute inset-0 rounded-lg bg-gradient-to-r from-${option.color}/10 via-${option.color}/5 to-${option.color}/10 animate-pulse`}
                                />
                              </div>
                            )}

                            {/* Hover scan line effect - only for non-selected items */}
                            {!isSelected && (
                              <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                                <div
                                  className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${option.color} to-transparent transform -translate-x-full group-hover:translate-x-full group-hover:transition-transform group-hover:duration-1000 group-hover:ease-linear`}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="mt-8 text-center">
                    <Link href="/mint">
                      <Button
                        disabled={!selectedPath}
                        className={`px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-bold tracking-wider transition-all duration-300 ${
                          selectedPath
                            ? "cyber-button hover:scale-105 hover:shadow-2xl hover:shadow-cyber-cyan/30"
                            : "bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Sparkles className="w-5 h-5 mr-3" />
                        Continue
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </Button>
                    </Link>
                  </div>

                  {/* Selection Status */}
                  <div className="mt-6 text-center">
                    {selectedPath ? (
                      <p className="text-sm text-cyber-green tracking-wide">
                        ✓ {pathOptions.find((p) => p.id === selectedPath)?.title} selected
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 tracking-wide">Please select a card path to continue</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
