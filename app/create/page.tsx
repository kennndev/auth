"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { CardPreview } from "@/components/card-preview"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import {
  Sparkles,
  Upload,
  Key,
  ExternalLink,
  AlertTriangle,
  Palette,
  Frame,
  Coins,
  Package,
  Eye,
  EyeOff,
} from "lucide-react"

export default function CreatePage() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiService, setAiService] = useState<"openai" | "venice">("openai")
  const [activeTab, setActiveTab] = useState<"artwork" | "frame">("artwork")
  const [artworkPrompt, setArtworkPrompt] = useState("")
  const [framePrompt, setFramePrompt] = useState("")
  const [cardTitle] = useState("")
  const [cardDescription] = useState("")
  const [cardStats] = useState({ attack: "", defense: "", health: "" })
  const [generatedArtwork, setGeneratedArtwork] = useState<string[]>([])
  const [generatedFrames, setGeneratedFrames] = useState<string[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState("")
  const [selectedFrame, setSelectedFrame] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const isNavVisible = useNavigationVisibility()

  const handleGenerateArtwork = async () => {
    if (!apiKey) return
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setGeneratedArtwork([
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
      ])
      setIsGenerating(false)
    }, 2000)
  }

  const handleGenerateFrame = async () => {
    if (!apiKey) return
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setGeneratedFrames([
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
      ])
      setIsGenerating(false)
    }, 2000)
  }

  const getApiKeyPlaceholder = () => {
    return aiService === "openai" ? "Enter your OpenAI API key..." : "Enter your Venice AI API key..."
  }

  return (
    <div className="min-h-screen bg-cyber-black relative font-mono">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navigation />

      <div className="px-6 py-8 pt-24 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">Create Trading Card</h1>
            <p className="text-gray-400">Design your card with AI-powered artwork and custom frames</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-3 space-y-6">
              {/* AI Service Configuration */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 tracking-wider">
                    <Key className="w-5 h-5 text-cyber-cyan" />
                    AI Service Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex p-1 bg-cyber-darker/50 rounded-full border border-cyber-cyan/30">
                    <Toggle
                      pressed={aiService === "openai"}
                      onPressedChange={() => setAiService("openai")}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                             data-[state=on]:bg-cyber-cyan data-[state=on]:text-cyber-black data-[state=on]:shadow-lg data-[state=on]:shadow-cyber-cyan/20
                             data-[state=off]:bg-transparent data-[state=off]:text-gray-400 hover:data-[state=off]:text-white"
                    >
                      OpenAI (DALL-E)
                    </Toggle>
                    <Toggle
                      pressed={aiService === "venice"}
                      onPressedChange={() => setAiService("venice")}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                             data-[state=on]:bg-cyber-cyan data-[state=on]:text-cyber-black data-[state=on]:shadow-lg data-[state=on]:shadow-cyber-cyan/20
                             data-[state=off]:bg-transparent data-[state=off]:text-gray-400 hover:data-[state=off]:text-white"
                    >
                      Venice AI
                    </Toggle>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-gray-300 tracking-wide">
                      API Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder={getApiKeyPlaceholder()}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-white" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:text-cyber-pink hover:shadow-lg hover:shadow-cyber-pink/20 tracking-wider"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Get Key
                      </Button>
                    </div>
                  </div>

                  <Button size="sm" className="cyber-button tracking-wider" disabled={!apiKey}>
                    Save Configuration
                  </Button>

                  {!apiKey && (
                    <Alert className="bg-cyber-orange/10 border-cyber-orange/30">
                      <AlertTriangle className="h-4 w-4 text-cyber-orange" />
                      <AlertDescription className="text-cyber-orange">
                        API key is required for AI generation features
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* AI Generation */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 tracking-wider">
                    <Sparkles className="w-5 h-5 text-cyber-cyan" />
                    AI Generation
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Generate individual components using AI</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex p-1 bg-cyber-darker/50 rounded-full border border-cyber-cyan/30">
                    <Toggle
                      pressed={activeTab === "artwork"}
                      onPressedChange={() => setActiveTab("artwork")}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                             data-[state=on]:bg-cyber-cyan data-[state=on]:text-cyber-black data-[state=on]:shadow-lg data-[state=on]:shadow-cyber-cyan/20
                             data-[state=off]:bg-transparent data-[state=off]:text-gray-400 hover:data-[state=off]:text-white"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Artwork
                    </Toggle>
                    <Toggle
                      pressed={activeTab === "frame"}
                      onPressedChange={() => setActiveTab("frame")}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                             data-[state=on]:bg-cyber-cyan data-[state=on]:text-cyber-black data-[state=on]:shadow-lg data-[state=on]:shadow-cyber-cyan/20
                             data-[state=off]:bg-transparent data-[state=off]:text-gray-400 hover:data-[state=off]:text-white"
                    >
                      <Frame className="w-4 h-4 mr-2" />
                      Frame & Text
                    </Toggle>
                  </div>

                  {activeTab === "artwork" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 tracking-wider">Artwork Generation</h3>
                        <p className="text-gray-400 text-sm mb-6">Describe the artwork you want for your card.</p>

                        <Textarea
                          placeholder="e.g., A majestic dragon breathing fire in a fantasy landscape with purple skies"
                          value={artworkPrompt}
                          onChange={(e) => setArtworkPrompt(e.target.value)}
                          className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 min-h-[100px] focus:border-cyber-cyan"
                        />

                        <Button
                          onClick={handleGenerateArtwork}
                          disabled={!apiKey || isGenerating}
                          className="w-full mt-4 cyber-button tracking-wider"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isGenerating ? "Generating..." : "Generate Artwork"}
                        </Button>
                      </div>

                      {generatedArtwork.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 tracking-wide">Generated Artwork</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {generatedArtwork.map((artwork, index) => (
                              <div
                                key={index}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedArtwork === artwork
                                    ? "border-cyber-cyan shadow-lg shadow-cyber-cyan/20"
                                    : "border-cyber-pink/30 hover:border-cyber-pink/50"
                                }`}
                                onClick={() => setSelectedArtwork(artwork)}
                              >
                                <img
                                  src={artwork || "/placeholder.svg"}
                                  alt={`Generated artwork ${index + 1}`}
                                  className="w-full h-20 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "frame" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 tracking-wider">
                          Frame & Text Generation
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                          Describe the frame style and card text you want for your card.
                        </p>

                        <Textarea
                          placeholder="e.g., Holographic border with cosmic energy effects and glowing runes, and a title 'Cyber Dragon' with description 'A digital beast from the neon city.'"
                          value={framePrompt}
                          onChange={(e) => setFramePrompt(e.target.value)}
                          className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 min-h-[100px] focus:border-cyber-cyan"
                        />

                        <Button
                          onClick={handleGenerateFrame}
                          disabled={!apiKey || isGenerating}
                          className="w-full mt-4 cyber-button tracking-wider"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isGenerating ? "Generating..." : "Generate Frame & Text"}
                        </Button>
                      </div>

                      {generatedFrames.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 tracking-wide">Generated Frames & Text</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {generatedFrames.map((frame, index) => (
                              <div
                                key={index}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedFrame === frame
                                    ? "border-cyber-cyan shadow-lg shadow-cyber-cyan/20"
                                    : "border-cyber-pink/30 hover:border-cyber-pink/50"
                                }`}
                                onClick={() => setSelectedFrame(frame)}
                              >
                                <img
                                  src={frame || "/placeholder.svg"}
                                  alt={`Generated frame ${index + 1}`}
                                  className="w-full h-20 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator className="bg-cyber-cyan/20" />
                    </div>
                  )}

                  <Separator className="bg-cyber-cyan/20" />

                  <div className="text-center space-y-6">
                    <p className="text-gray-400 text-sm tracking-wide">Or Upload Your Own</p>
                    <p className="text-gray-400 text-xs">
                      Upload your own complete card design (includes artwork, frame, and text)
                    </p>
                    <Button className="w-full cyber-button tracking-wider">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Card Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* NFT Specifications */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 tracking-wider">
                    <Coins className="w-5 h-5 text-cyber-cyan" />
                    Mint Your NFT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 tracking-wide">Wallet Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-400">Not Connected</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 tracking-wide">Card Destination</Label>
                      <Select>
                        <SelectTrigger className="bg-cyber-darker/50 border-cyber-cyan/30 text-white focus:border-cyber-cyan">
                          <SelectValue placeholder="Select blockchain" />
                        </SelectTrigger>
                        <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="solana">Solana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 tracking-wide">Mintable Supply</Label>
                      <Input
                        placeholder="100"
                        className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 tracking-wide">Minting Limit per Wallet</Label>
                      <Input
                        placeholder="5"
                        className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 tracking-wide">Transferability</Label>
                    <div className="flex gap-2">
                      <Toggle className="text-gray-400 hover:text-cyber-black data-[state=on]:bg-cyber-green/20 data-[state=on]:text-cyber-green data-[state=on]:border-cyber-green/50 tracking-wide">
                        Tradeable
                      </Toggle>
                      <Toggle className="text-gray-400 hover:text-cyber-black data-[state=on]:bg-cyber-purple/20 data-[state=on]:text-cyber-purple data-[state=on]:border-cyber-purple/50 tracking-wide">
                        Soulbound
                      </Toggle>
                    </div>
                  </div>

                  <Button className="w-full cyber-button tracking-wider">
                    <Package className="w-4 h-4 mr-2" />
                    Order Physical Card
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Card Preview */}
            <div className="lg:col-span-2">
              <div className={`sticky transition-all duration-300 ease-in-out ${isNavVisible ? "top-24" : "top-4"}`}>
                <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white tracking-wider">Card Preview</CardTitle>
                    <p className="text-gray-400 text-sm">Live preview of your trading card</p>
                  </CardHeader>
                  <CardContent>
                    <CardPreview
                      title={cardTitle}
                      description={cardDescription}
                      artwork={selectedArtwork}
                      frame={selectedFrame}
                      stats={cardStats}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
