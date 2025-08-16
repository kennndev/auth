"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { Heart, Share2, Eye, Package, Plus, Sparkles, Upload, Coins } from "lucide-react"
import Link from "next/link"

const mockCards = [
  {
    id: 1,
    title: "Your Dragon Lord",
    creator: "You",
    image: "/placeholder.svg?height=300&width=250",
    likes: 42,
    views: 156,
    rarity: "Legendary",
    physicalStatus: "ordered", // "none", "ordered", "shipped", "delivered"
    nftStatus: "none", // "none", "minted", "listed"
  },
  {
    id: 2,
    title: "Your Cyber Warrior",
    creator: "You",
    image: "/placeholder.svg?height=300&width=250",
    likes: 28,
    views: 89,
    rarity: "Epic",
    physicalStatus: "none",
    nftStatus: "minted",
  },
  {
    id: 3,
    title: "Your Mystic Phoenix",
    creator: "You",
    image: "/placeholder.svg?height=300&width=250",
    likes: 15,
    views: 45,
    rarity: "Rare",
    physicalStatus: "none",
    nftStatus: "none",
  },
  {
    id: 4,
    title: "Your Cosmic Beast",
    creator: "You",
    image: "/placeholder.svg?height=300&width=250",
    likes: 67,
    views: 203,
    rarity: "Legendary",
    physicalStatus: "delivered",
    nftStatus: "minted",
  },
]

export default function MyCardsPage() {
  const [activeTab, setActiveTab] = useState("created")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/30"
      case "Epic":
        return "text-cyber-purple bg-cyber-purple/10 border-cyber-purple/30"
      case "Rare":
        return "text-cyber-blue bg-cyber-blue/10 border-cyber-blue/30"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30"
    }
  }

  const getPhysicalStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
        return "text-cyber-orange bg-cyber-orange/10 border-cyber-orange/30"
      case "shipped":
        return "text-cyber-blue bg-cyber-blue/10 border-cyber-blue/30"
      case "delivered":
        return "text-cyber-green bg-cyber-green/10 border-cyber-green/30"
      default:
        return ""
    }
  }

  const getNftStatusColor = (status: string) => {
    switch (status) {
      case "minted":
        return "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30"
      case "listed":
        return "text-cyber-purple bg-cyber-purple/10 border-cyber-purple/30"
      default:
        return ""
    }
  }

  const getPhysicalStatusText = (status: string) => {
    switch (status) {
      case "ordered":
        return "Physical Ordered"
      case "shipped":
        return "Physical Shipped"
      case "delivered":
        return "Physical Delivered"
      default:
        return ""
    }
  }

  const getNftStatusText = (status: string) => {
    switch (status) {
      case "minted":
        return "NFT Minted"
      case "listed":
        return "NFT Listed"
      default:
        return ""
    }
  }

  const getCardActions = (physicalStatus: string, nftStatus: string) => {
    const canOrderPhysical = physicalStatus === "none"
    const canMintNft = nftStatus === "none"
    const hasActions = canOrderPhysical || canMintNft

    if (!hasActions) {
      return (
        <Button className="flex-1 h-9 cyber-button tracking-wider">
          <Eye className="w-3 h-3 mr-1" />
          View Details
        </Button>
      )
    }

    if (canOrderPhysical && canMintNft) {
      return (
        <div className="flex flex-col gap-2 w-full">
          <Button className="flex-1 h-9 bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10 hover:shadow-lg hover:shadow-cyber-green/20 tracking-wider">
            <Package className="w-3 h-3 mr-1" />
            Order Print
          </Button>
          <Button className="flex-1 h-9 cyber-button tracking-wider">
            <Coins className="w-3 h-3 mr-1" />
            Mint NFT
          </Button>
        </div>
      )
    }

    if (canOrderPhysical) {
      return (
        <Button className="flex-1 h-9 bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10 hover:shadow-lg hover:shadow-cyber-green/20 tracking-wider">
          <Package className="w-3 h-3 mr-1" />
          Order Print
        </Button>
      )
    }

    if (canMintNft) {
      return (
        <Button className="flex-1 h-9 cyber-button tracking-wider">
          <Coins className="w-3 h-3 mr-1" />
          Mint NFT
        </Button>
      )
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute inset-0 scanlines opacity-20" />

      <Navigation />

      <div className="px-6 py-8 pt-24 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">My Cards</h1>
            <p className="text-gray-400">Design amazing trading cards and bring them to life</p>
          </div>

          {/* Personal Collection Tabs */}
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-cyber-darker/50">
                <TabsTrigger
                  value="created"
                  className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan data-[state=active]:border-b-2 data-[state=active]:border-cyber-cyan tracking-wide"
                >
                  Created
                </TabsTrigger>
                <TabsTrigger
                  value="owned"
                  className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan data-[state=active]:border-b-2 data-[state=active]:border-cyber-cyan tracking-wide"
                >
                  Owned
                </TabsTrigger>
                <TabsTrigger
                  value="drafts"
                  className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan data-[state=active]:border-b-2 data-[state=active]:border-cyber-cyan tracking-wide"
                >
                  Drafts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Empty State Message */}
          <div className="text-center mb-8 p-6 bg-cyber-dark/30 backdrop-blur-sm border border-cyber-cyan/20 rounded-lg">
            <h3 className="text-xl font-bold text-cyber-cyan mb-2 tracking-wider">Welcome to Your Collection!</h3>
            <p className="text-gray-400 mb-4">
              Start creating your first trading card to build your personal collection
            </p>
            <p className="text-sm text-gray-500">
              Generate AI artwork or upload your own designs, then order physical prints and/or mint as NFTs
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create Your First Card CTA */}
            <Card className="bg-gradient-to-br from-cyber-dark/80 to-cyber-darker/60 backdrop-blur-sm border-2 border-dashed border-cyber-green/50 hover:border-cyber-green hover:shadow-lg hover:shadow-cyber-green/20 transition-all duration-500 group cursor-pointer">
              <Link href="/create">
                <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                  <div className="w-20 h-20 bg-cyber-green/20 rounded-full flex items-center justify-center group-hover:bg-cyber-green/30 transition-colors">
                    <Plus className="w-10 h-10 text-cyber-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cyber-green mb-2 tracking-wider">Create Your First Card</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Generate AI artwork or upload your own designs to create your first trading card
                    </p>
                  </div>
                  <Button className="cyber-button tracking-wider group-hover:shadow-lg group-hover:shadow-cyber-green/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* User's Cards */}
            {mockCards.map((card) => (
              <Card
                key={card.id}
                className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20 transition-all duration-500 group"
              >
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={card.image || "/placeholder.svg"}
                      alt={card.title}
                      className="w-full aspect-[4/5] object-cover rounded-lg border border-cyber-pink/20"
                    />

                    {/* Status badges - can show multiple */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {card.physicalStatus !== "none" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border tracking-wider ${getPhysicalStatusColor(card.physicalStatus)}`}
                        >
                          {getPhysicalStatusText(card.physicalStatus)}
                        </span>
                      )}
                      {card.nftStatus !== "none" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border tracking-wider ${getNftStatusColor(card.nftStatus)}`}
                        >
                          {getNftStatusText(card.nftStatus)}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border tracking-wider ${getRarityColor(card.rarity)}`}
                      >
                        {card.rarity}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-cyber-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <Button size="sm" className="cyber-button tracking-wider">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                    {/* Holographic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 via-transparent to-cyber-pink/5 opacity-30 rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-white truncate tracking-wider">{card.title}</h3>
                    <p className="text-sm text-cyber-cyan tracking-wide">Created by {card.creator}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span className="tracking-wide">{card.likes}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span className="tracking-wide">{card.views}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {getCardActions(card.physicalStatus, card.nftStatus)}
                      <Button className="h-9 bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-green/30 max-w-2xl mx-auto">
              <CardContent className="py-6 px-6">
                <h3 className="text-2xl font-bold text-cyber-green mb-3 tracking-wider">Ready to Create More?</h3>
                <p className="text-gray-400 mb-6">
                  Expand your collection with AI-generated artwork or upload your own designs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/create">
                    <Button className="cyber-button px-8 py-3 text-lg tracking-wider">
                      <Sparkles className="w-5 h-5 mr-3" />
                      Create Another Card
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button className="bg-cyber-dark border-2 border-cyber-purple text-cyber-purple hover:bg-cyber-purple/10 hover:shadow-lg hover:shadow-cyber-purple/20 px-8 py-3 text-lg tracking-wider">
                      <Upload className="w-5 h-5 mr-3" />
                      Upload Artwork
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
