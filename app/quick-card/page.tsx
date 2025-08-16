"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { FlippableCardPreview } from "@/components/flippable-card-preview"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import {
  Camera,
  Sparkles,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const scenes = [
  {
    id: "fantasy-warrior",
    name: "Fantasy Warrior",
    imageQuery: "Fantasy Warrior Battle Scene",
    prompt:
      "Epic fantasy warrior in gleaming armor wielding a legendary sword, standing heroically on a battlefield with dramatic lighting and mystical energy swirling around",
  },
  {
    id: "space-explorer",
    name: "Space Explorer",
    imageQuery: "Nebula Space Exploration",
    prompt:
      "Futuristic space explorer in advanced suit floating among colorful nebulae and distant galaxies, with cosmic energy and starlight illuminating the scene",
  },
  {
    id: "dragon-rider",
    name: "Dragon Rider",
    imageQuery: "Dragon Rider Soaring Sky",
    prompt:
      "Brave dragon rider soaring through storm clouds on a majestic dragon, with lightning crackling and wind-swept hair, epic aerial adventure",
  },
  {
    id: "cyberpunk-hero",
    name: "Cyberpunk Hero",
    imageQuery: "Neon Cyberpunk City Hero",
    prompt:
      "Cyberpunk hero in high-tech gear standing in neon-lit city streets, with holographic displays and futuristic architecture, rain-soaked pavement reflecting neon lights",
  },
  {
    id: "magical-wizard",
    name: "Magical Wizard",
    imageQuery: "Wizard Casting Spell Forest",
    prompt:
      "Powerful wizard casting an ancient spell in an enchanted forest, with magical energy spiraling from hands, glowing runes, and mystical creatures watching from shadows",
  },
  {
    id: "underwater-adventure",
    name: "Underwater Adventure",
    imageQuery: "Coral Reef Underwater Explorer",
    prompt:
      "Deep sea adventurer exploring vibrant coral reefs with exotic sea creatures, bioluminescent plants, and ancient underwater ruins in crystal clear waters",
  },
  {
    id: "mystic-forest",
    name: "Mystic Forest",
    imageQuery: "Enchanted Forest Pathway",
    prompt:
      "Guardian of an ethereal enchanted forest with glowing trees, floating lights, magical creatures, and ancient wisdom emanating from every shadow",
  },
  {
    id: "celestial-being",
    name: "Celestial Being",
    imageQuery: "Cosmic Angel Stars",
    prompt:
      "Celestial being with wings of starlight floating among swirling galaxies, cosmic energy radiating outward, surrounded by nebulae and distant worlds",
  },
  {
    id: "steampunk-inventor",
    name: "Steampunk Inventor",
    imageQuery: "Victorian Steampunk Workshop",
    prompt:
      "Brilliant steampunk inventor in Victorian-era workshop surrounded by brass gears, steam-powered contraptions, and mechanical marvels with goggles and leather apron",
  },
  {
    id: "ninja-assassin",
    name: "Ninja Assassin",
    imageQuery: "Shadow Ninja Rooftop",
    prompt:
      "Stealthy ninja assassin crouched on moonlit rooftop with traditional weapons, flowing dark robes, and mysterious shadows concealing their presence",
  },
]

export default function QuickCardPage() {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState("")
  const [styleIntensity, setStyleIntensity] = useState(50)
  const [generateVariations, setGenerateVariations] = useState(false)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedCardArtwork, setGeneratedCardArtwork] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isNavVisible = useNavigationVisibility()

  const handlePhotoUpload = useCallback((file: File) => {
    setUploadError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setUploadError(validationError)
      setUploadedPhoto(null)
      setUploadedFileName(null)
      return
    }

    setIsUploading(true)
    setUploadedPhoto(null)
    setUploadedFileName(file.name)
    setUploadProgress(0)

    // Simulate upload
    const reader = new FileReader()
    reader.onloadstart = () => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          reader.readAsDataURL(file)
        }
      }, 50)
    }
    reader.onloadend = () => {
      setUploadedPhoto(reader.result as string)
      setIsUploading(false)
      setUploadProgress(100)
    }
    reader.onerror = () => {
      setIsUploading(false)
      setUploadError("Failed to read file.")
    }
    setUploadProgress(1)
  }, [])

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) return "Invalid file type. Use PNG or JPG."
    if (file.size > maxSize) return "File too large. Max 5MB."
    return null
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.currentTarget.classList.remove("border-cyber-pink", "bg-cyber-pink/10")
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoUpload(e.dataTransfer.files[0])
      }
    },
    [handlePhotoUpload],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add("border-cyber-pink", "bg-cyber-pink/10")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove("border-cyber-pink", "bg-cyber-pink/10")
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpload(e.target.files[0])
    }
  }

  const handleSceneSelect = (scene: (typeof scenes)[0]) => {
    setSelectedScene(scene.id)
    setCustomPrompt(scene.prompt)
  }

  const scrollScenes = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  const handleGenerateCard = () => {
    if (!uploadedPhoto || !selectedScene) {
      return
    }
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedCardArtwork(null)

    // Simulate generation
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setGenerationProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsGenerating(false)
        setGeneratedCardArtwork(
          `/placeholder.svg?height=350&width=250&query=${scenes.find((s) => s.id === selectedScene)?.name}+${customPrompt.slice(0, 50) || "epic+card"}`,
        )
      }
    }, 200)
  }

  return (
    <div className="min-h-screen bg-cyber-black relative font-mono">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navigation />

      <div className="px-6 py-8 pt-24 pb-32 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">Quick Card Creator</h1>
            <p className="text-gray-400">
              Create AI-powered trading cards in seconds - just upload your photo and choose your scene!
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-3 space-y-6">
              {/* Photo Upload Area */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between tracking-wider">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-cyber-cyan" />
                      Upload Your Photo
                    </div>
                    <span className="text-xs bg-cyber-cyan/20 text-cyber-cyan px-2 py-1 rounded-full border border-cyber-cyan/30">
                      Step 1 of 3
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer 
                              ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-cyber-pink/80 hover:bg-cyber-pink/5"} border-cyber-cyan/50`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !isUploading && document.getElementById("quick-photo-input")?.click()}
                  >
                    <input
                      id="quick-photo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                      <ImageIcon className="w-12 h-12 text-cyber-cyan/70" />
                      <p className="font-semibold text-white">Drag & drop or click to upload</p>
                      <p className="text-xs">PNG or JPG (Max 5MB)</p>
                      <p className="text-xs text-cyber-yellow/80">For best results, use a clear front-facing photo.</p>
                    </div>
                  </div>

                  {isUploading && uploadedFileName && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-300">Uploading: {uploadedFileName}</p>
                      <Progress
                        value={uploadProgress}
                        className="h-2 bg-cyber-darker [&>div]:bg-gradient-to-r [&>div]:from-cyber-cyan [&>div]:to-cyber-pink"
                      />
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-4 p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-md flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-cyber-red" />
                      <p className="text-xs text-cyber-red">{uploadError}</p>
                    </div>
                  )}
                  {uploadedPhoto && !isUploading && uploadedFileName && (
                    <div className="mt-4 p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-md flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyber-green" />
                      <p className="text-xs text-cyber-green">Uploaded: {uploadedFileName}</p>
                    </div>
                  )}
                  {uploadedPhoto && !isUploading && (
                    <div className="mt-4 p-2 border border-cyber-cyan/30 rounded-lg bg-cyber-darker">
                      <img
                        src={uploadedPhoto || "/placeholder.svg"}
                        alt="Uploaded preview"
                        className="max-h-32 w-auto mx-auto rounded"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scene Selection Slider */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-pink/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between tracking-wider">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyber-pink" />
                      Choose Your Scene
                    </div>
                    <span className="text-xs bg-cyber-pink/20 text-cyber-pink px-2 py-1 rounded-full border border-cyber-pink/30">
                      Step 2 of 3
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <button
                      onClick={() => scrollScenes("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-cyber-dark/80 hover:bg-cyber-dark border border-cyber-pink/50 rounded-full p-2 transition-all duration-200 hover:border-cyber-pink"
                    >
                      <ChevronLeft className="w-4 h-4 text-cyber-pink" />
                    </button>
                    <button
                      onClick={() => scrollScenes("right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-cyber-dark/80 hover:bg-cyber-dark border border-cyber-pink/50 rounded-full p-2 transition-all duration-200 hover:border-cyber-pink"
                    >
                      <ChevronRight className="w-4 h-4 text-cyber-pink" />
                    </button>
                    <div
                      ref={scrollContainerRef}
                      className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-cyber-pink/50 scrollbar-track-cyber-darker pb-2 px-8"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {scenes.map((scene) => (
                        <div
                          key={scene.id}
                          onClick={() => handleSceneSelect(scene)}
                          className={`relative flex-shrink-0 w-36 h-48 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 group
                                    ${selectedScene === scene.id ? "border-cyber-pink shadow-xl shadow-cyber-pink/30 scale-105" : "border-cyber-pink/40 hover:border-cyber-pink/70 hover:scale-102"}`}
                        >
                          <img
                            src={`/placeholder.svg?height=192&width=144&query=${encodeURIComponent(scene.imageQuery)}`}
                            alt={scene.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 via-cyber-black/40 to-transparent" />
                          {selectedScene === scene.id && (
                            <div className="absolute inset-0 border-2 border-cyber-pink rounded-md pointer-events-none animate-pulse opacity-50" />
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                            <h4
                              className={`text-xs font-semibold tracking-wider transition-colors ${selectedScene === scene.id ? "text-cyber-pink" : "text-white group-hover:text-cyber-pink/90"}`}
                            >
                              {scene.name}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Controls */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-green/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between tracking-wider">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyber-green" />
                      Generation Settings
                    </div>
                    <span className="text-xs bg-cyber-green/20 text-cyber-green px-2 py-1 rounded-full border border-cyber-green/30">
                      Step 3 of 3
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="custom-prompt" className="text-gray-300 mb-2 block">
                      Scene Prompt
                    </Label>
                    <textarea
                      id="custom-prompt"
                      placeholder="Scene description will auto-fill when you select a scene above..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                      className="w-full bg-cyber-darker/50 border border-cyber-green/50 rounded-md p-3 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-cyber-green focus:border-cyber-green resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="style-intensity" className="text-gray-300">
                        Style Intensity
                      </Label>
                      <span className="text-sm text-cyber-green">{styleIntensity}% Fantasy</span>
                    </div>
                    <Slider
                      id="style-intensity"
                      min={0}
                      max={100}
                      step={1}
                      value={[styleIntensity]}
                      onValueChange={(value) => setStyleIntensity(value[0])}
                      className="[&>span:first-child]:bg-cyber-green/30 [&>span:last-child>span]:bg-cyber-green [&>span:last-child>span]:border-2 [&>span:last-child>span]:border-cyber-black"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Realistic</span>
                      <span>Fantasy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="generate-variations" className="text-gray-300 flex items-center gap-2">
                      Generate 4 Variations
                      <Info size={14} className="text-gray-500" title="Get multiple options for your card." />
                    </Label>
                    <Switch
                      id="generate-variations"
                      checked={generateVariations}
                      onCheckedChange={setGenerateVariations}
                      className="data-[state=checked]:bg-cyber-green data-[state=unchecked]:bg-cyber-darker/80 border-2 border-cyber-green/50 data-[state=checked]:border-cyber-green"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateCard}
                    disabled={!uploadedPhoto || !selectedScene || isGenerating || isUploading}
                    className="w-full cyber-button text-lg py-3 tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" /> Generate Epic Card
                      </>
                    )}
                  </Button>
                  {isGenerating && (
                    <div className="mt-2 space-y-1">
                      <Progress
                        value={generationProgress}
                        className="h-1 bg-cyber-darker [&>div]:bg-gradient-to-r [&>div]:from-cyber-green [&>div]:to-cyber-cyan"
                      />
                      <p className="text-xs text-cyber-green text-center">
                        Conjuring awesomeness... {generationProgress}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Card Preview */}
            <div className="lg:col-span-2">
              <div className={`sticky transition-all duration-300 ease-in-out ${isNavVisible ? "top-24" : "top-4"}`}>
                <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white tracking-wider">Card Preview</CardTitle>
                    <p className="text-gray-400 text-sm">Hover to see the back of your card</p>
                  </CardHeader>
                  <CardContent>
                    <FlippableCardPreview artwork={generatedCardArtwork || uploadedPhoto} />
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
