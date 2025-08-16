"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  Copy, 
  RotateCcw, 
  ExternalLink,
  Zap,
  Star,
  X,
  ArrowDown
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PromptFields {
  mainCharacter: string
  background: string
  frameStyle: string
  titleText: string
  additionalText: string
}

const FRAME_STYLES = [
  {
    id: "none",
    name: "No Frame",
    description: "Pure artwork with no frame elements",
    basePrompt: "Create a full-art card with no frame or border elements, allowing the artwork to fill the entire card.",
    titleTextPrompt: "Overlay the title text directly on the artwork in a bold, readable font with a subtle shadow or glow effect to ensure visibility against the background.",
    additionalTextPrompt: "Place additional text in a complementary position with similar styling to maintain readability.",
    bothTextsPrompt: "Position the title prominently and the additional text as supporting information, both with effects to ensure visibility against the artwork."
  },
  {
    id: "pokemon",
    name: "TCG Style",
    description: "Full-art layout with blue capsule and red header",
    basePrompt: "Use a full-art Pokémon-style card layout with no distinct border around the artwork. The top left contains a small stage label inside a blue capsule.",
    titleTextPrompt: "Place the card name in bold white serif font on a dark red rectangular header at the top left. The top right displays HP in bold white text next to a circular energy symbol.",
    additionalTextPrompt: "Include attack descriptions in clean white sans-serif font directly over the artwork with semi-transparent boxes. The lower portion includes semi-transparent boxes for weakness, resistance, and retreat symbols.",
    bothTextsPrompt: "Place the card name in bold white serif font on a dark red rectangular header at the top left. The top right displays HP in bold white text next to a circular energy symbol. Use the additional text as attack names and descriptions, placed directly over the artwork in bold black text with energy icons to the left. Attack descriptions in clean white sans-serif font. The lower portion includes semi-transparent boxes for weakness, resistance, and retreat symbols. Flavor text appears in a thin, italicized box in the bottom right corner."
  },
  {
    id: "magic",
    name: "Magic Fantasy",
    description: "Fantasy frame with curved banner and flourishes",
    basePrompt: "Use a full-art trading card frame inspired by Magic: The Gathering, with no visible borders.",
    titleTextPrompt: "Place the card name at the top left in a bold serif font, enclosed in a curved, 50% transparent banner. Align mana cost symbols to the top right.",
    additionalTextPrompt: "Include a wide, rounded 50% transparent textbox in the lower third that varies in size with the amount of text (should be positioned as far down as it can), containing the text in a legible serif font. Show a power/toughness box in the bottom right corner, clearly visible against the art.",
    bothTextsPrompt: "Place the card name at the top left in a bold serif font, enclosed in a curved, 50% transparent banner. Align mana cost symbols to the top right. Include the additional text as a type line (bold) and rules text in a wide, rounded 50% transparent textbox in the lower third that varies in size with the amount of text (should be positioned as far down as it can). Show a power/toughness box in the bottom right corner, clearly visible against the art."
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Style",
    description: "Digital interface with circuit borders and HUD elements",
    basePrompt: "Use a full-art digital trading card frame with a high-tech, cyber interface design. Outline with thin, angular circuit-like borders and corner connectors. Include stylized HUD-style graphical elements in frame corners.",
    titleTextPrompt: "Display the character name in bold, all-caps text with digital styling, integrated into the cyber interface.",
    additionalTextPrompt: "Include subtitle text in a matching digital font style, positioned to complement the interface design.",
    bothTextsPrompt: "Display the title in bold, all-caps text centered near the bottom of the card within the digital interface. Place the additional text as a smaller subtitle below it in matching font style. Integrate both text elements seamlessly with the HUD-style graphical elements and circuit patterns."
  }
]

const EXAMPLE_STYLES = [
  {
    id: "fantasy",
    name: "Fantasy Epic",
    image: "/fantasy-example-card.webp",
    fields: {
      mainCharacter: "a majestic dragon with emerald scales and golden eyes",
      background: "ancient ruins beneath a starlit sky with floating crystals",
      frameStyle: "magic",
      titleText: "Eternal Dragon",
      additionalText: "Guardian of the Ancient Realm"
    }
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    image: "/cyberpunk-example-card.webp",
    fields: {
      mainCharacter: "a neon-lit cyborg assassin with holographic implants",
      background: "rain-soaked dystopian city with towering holograms",
      frameStyle: "cyberpunk",
      titleText: "NEXUS-7",
      additionalText: "ELITE BOUNTY HUNTER"
    }
  },
  {
    id: "anime",
    name: "Anime Hero",
    image: "/anime-hero-example-card.webp",
    fields: {
      mainCharacter: "a determined warrior with flowing silver hair and glowing sword",
      background: "cherry blossom battlefield with petals swirling in the wind",
      frameStyle: "pokemon",
      titleText: "Sakura Blade Master",
      additionalText: "Swift Strike - 120 damage"
    }
  },
  {
    id: "horror",
    name: "Dark Horror",
    image: "/dark-horror-example-card.webp",
    fields: {
      mainCharacter: "a shadowy specter with glowing red eyes emerging from darkness",
      background: "abandoned mansion under a blood moon with creeping fog",
      frameStyle: "magic",
      titleText: "Shadow Wraith",
      additionalText: "Creature - Spirit Horror"
    }
  }
]

const AI_TOOLS = [
  {
    name: "ChatGPT",
    url: "https://chat.openai.com",
    icon: "🤖",
    color: "hover:border-green-400 hover:text-green-400",
    description: "Includes DALL-E 3"
  }
]

export function AIGenerationModal({ isOpen, onClose }: AIGenerationModalProps) {
  const [activeTab, setActiveTab] = useState("prompt-builder")
  const [fields, setFields] = useState<PromptFields>({
    mainCharacter: "",
    background: "",
    frameStyle: "",
    titleText: "",
    additionalText: ""
  })
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  
  // State for smooth closing animation
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // State for inactivity hint
  const [showExampleHint, setShowExampleHint] = useState(false)
  
  // Handle smooth open/close transitions
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    } else if (isVisible) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen, isVisible])

  // Handle inactivity detection for showing hint
  useEffect(() => {
    const hasAnyInput = fields.mainCharacter || fields.background || 
                       fields.frameStyle || fields.titleText || fields.additionalText
    
    if (isOpen && activeTab === "prompt-builder" && !hasAnyInput) {
      const timer = setTimeout(() => {
        setShowExampleHint(true)
      }, 10000) // Show hint after 10 seconds of inactivity
      
      return () => {
        clearTimeout(timer)
        setShowExampleHint(false)
      }
    } else {
      setShowExampleHint(false)
    }
  }, [isOpen, activeTab, fields])

  // Generate prompt based on fields
  const generatePrompt = () => {
    if (!fields.mainCharacter && !fields.background && !fields.frameStyle && !fields.titleText && !fields.additionalText) {
      return ""
    }

    let prompt = "Create a fully designed, high-resolution trading card image in portrait orientation with an aspect ratio of 2.5:3.5 (standard playing card dimensions).\n"
    
    // Add character and background
    if (fields.mainCharacter) {
      prompt += `• Main character: ${fields.mainCharacter}\n`
    }
    
    if (fields.background) {
      prompt += `• Background: ${fields.background}\n`
    }
    
    // Add frame and text styling dynamically
    if (fields.frameStyle) {
      const selectedFrame = FRAME_STYLES.find(style => style.id === fields.frameStyle)
      if (selectedFrame) {
        // Add base frame prompt
        prompt += `• Card frame: ${selectedFrame.basePrompt}\n`
        
        // Add text styling only if text is provided
        const hasTitle = fields.titleText.trim() !== ""
        const hasAdditional = fields.additionalText.trim() !== ""
        
        if (hasTitle && hasAdditional) {
          // Both texts provided
          prompt += `• Text elements: ${selectedFrame.bothTextsPrompt}\n`
          prompt += `  – Title text: "${fields.titleText}"\n`
          prompt += `  – Additional text: "${fields.additionalText}"\n`
        } else if (hasTitle) {
          // Only title provided
          prompt += `• Text elements: ${selectedFrame.titleTextPrompt}\n`
          prompt += `  – Title text: "${fields.titleText}"\n`
        } else if (hasAdditional) {
          // Only additional text provided
          prompt += `• Text elements: ${selectedFrame.additionalTextPrompt}\n`
          prompt += `  – Additional text: "${fields.additionalText}"\n`
        }
        // If no text is provided, no text instructions are added
      }
    } else {
      // No frame selected but text might be provided
      const hasTitle = fields.titleText.trim() !== ""
      const hasAdditional = fields.additionalText.trim() !== ""
      
      if (hasTitle || hasAdditional) {
        prompt += "• Text overlay: Place text directly on the artwork with effects (shadow, glow, or outline) to ensure readability.\n"
        if (hasTitle) {
          prompt += `  – Title: "${fields.titleText}" - positioned prominently\n`
        }
        if (hasAdditional) {
          prompt += `  – Additional text: "${fields.additionalText}" - positioned as supporting information\n`
        }
      }
    }
    
    // 3D breakout effect only if there's a frame
    if (fields.frameStyle && fields.frameStyle !== "none") {
      prompt += "• Special effect: The character should visually break through the frame, with parts of their body (such as weapon, arm, or cloak) extending past the border to give a 3D effect.\n"
    }
    
    prompt += "• The final composition should resemble a premium trading card: perfectly centered, clear layout, crisp detail, and layered effects with a dynamic visual style.\n"
    prompt += "• IMPORTANT: Generate the image in a 2.5:3.5 aspect ratio (portrait orientation, like a standard playing card). The image dimensions should be suitable for printing on a physical card."
    
    return prompt
  }

  const handleCopyPrompt = async () => {
    const prompt = generatePrompt()
    if (!prompt) return
    
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error("Failed to copy prompt:", err)
    }
  }

  const handleReset = () => {
    setFields({
      mainCharacter: "",
      background: "",
      frameStyle: "",
      titleText: "",
      additionalText: ""
    })
  }

  const handleUseExample = (example: typeof EXAMPLE_STYLES[0]) => {
    setFields(example.fields)
    setActiveTab("prompt-builder")
    setShowExampleHint(false)
  }

  const prompt = generatePrompt()

  // Don't render if modal is not visible
  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] font-mono transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay Background - Dismissible */}
      <div 
        className={`absolute inset-0 bg-cyber-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`} 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      />
      
      {/* Modal Content - Smart responsive centering with scrollability */}
      <div 
        className="relative h-full flex items-start sm:items-center justify-center overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <div className={`w-full max-w-3xl px-4 py-4 sm:py-8 lg:py-4 my-auto transition-all duration-300 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div 
            className="w-full bg-cyber-dark/95 backdrop-blur-sm border-2 border-cyber-cyan/30 font-mono rounded-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden title for accessibility */}
            <h1 className="sr-only">Cardify AI Card Generator</h1>
        
        {/* Cyberpunk Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-md border border-cyber-cyan/50 bg-cyber-dark/80 backdrop-blur-sm 
                     text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20
                     transition-all duration-200 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Coming Soon Banner - Integrated Design */}
        <div className="text-center mb-6 px-12 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-cyber-pink" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-5 h-5 text-cyber-pink opacity-75" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wider">
              Cardify AI Card Generator
            </h2>
            <div className="relative">
              <Sparkles className="w-5 h-5 text-cyber-pink" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-5 h-5 text-cyber-pink opacity-75" />
              </div>
            </div>
          </div>
          <span className="inline-block text-xs px-2 py-0.5 bg-gradient-to-r from-cyber-purple/20 to-cyber-pink/20 border border-cyber-purple/50 rounded-full text-cyber-purple uppercase tracking-wider font-semibold mb-3">
            Coming Soon
          </span>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            For now, use our tested prompt builder to create stunning cards with external AI tools
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            {/* Floating hint arrow - positioned absolutely to avoid layout shift */}
            {showExampleHint && (
              <div 
                className="absolute -top-14 right-0 w-1/2 flex flex-col items-center pointer-events-none z-20"
                style={{
                  animation: "fadeInFloat 0.5s ease-out forwards, float 2s ease-in-out 0.5s infinite"
                }}
              >
                <style jsx>{`
                  @keyframes fadeInFloat {
                    0% { 
                      opacity: 0;
                      transform: translateY(-20px);
                    }
                    100% { 
                      opacity: 1;
                      transform: translateY(0px);
                    }
                  }
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                  }
                `}</style>
                <div className="px-3 py-1 bg-cyber-dark/95 backdrop-blur-sm border border-cyber-cyan/50 rounded-full mb-1">
                  <p className="text-cyber-cyan text-xs font-semibold text-center">
                    Need ideas?
                  </p>
                </div>
                <ArrowDown className="w-5 h-5 text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
              </div>
            )}
            
            <div className="relative p-1 bg-cyber-darker/50 border border-cyber-cyan/30 rounded-lg overflow-hidden">
              {/* Sliding background */}
              <div 
                className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-6px)] bg-cyber-cyan rounded transition-transform duration-300 ease-in-out"
                style={{
                  transform: activeTab === "prompt-builder" ? "translateX(0)" : "translateX(calc(100% + 4px))"
                }}
              />
              <TabsList className="relative grid w-full grid-cols-2 bg-transparent border-0">
              <TabsTrigger 
                value="prompt-builder" 
                className="relative z-10 font-bold tracking-wider transition-colors duration-300
                           data-[state=active]:text-cyber-black data-[state=active]:bg-transparent
                           data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-200
                           data-[state=inactive]:bg-transparent"
              >
                Prompt Builder
              </TabsTrigger>
              <TabsTrigger 
                value="examples"
                className="relative z-10 font-bold tracking-wider transition-colors duration-300
                           data-[state=active]:text-cyber-black data-[state=active]:bg-transparent
                           data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-200
                           data-[state=inactive]:bg-transparent"
              >
                Example Styles
              </TabsTrigger>
            </TabsList>
            </div>
          </div>

          <TabsContent value="prompt-builder" className="space-y-6 mt-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title-text" className="text-cyber-cyan tracking-wide">
                  Title Text
                </Label>
                <Input
                  id="title-text"
                  placeholder="e.g., Eternal Dragon, NEXUS-7"
                  value={fields.titleText}
                  onChange={(e) => setFields({ ...fields, titleText: e.target.value })}
                  className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main-character" className="text-cyber-cyan tracking-wide">
                  Main Character Description
                </Label>
                <Input
                  id="main-character"
                  placeholder="e.g., a frost-covered samurai with glowing blue eyes"
                  value={fields.mainCharacter}
                  onChange={(e) => setFields({ ...fields, mainCharacter: e.target.value })}
                  className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background" className="text-cyber-cyan tracking-wide">
                  Background Setting
                </Label>
                <Input
                  id="background"
                  placeholder="e.g., a frozen battlefield under a pale moon"
                  value={fields.background}
                  onChange={(e) => setFields({ ...fields, background: e.target.value })}
                  className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frame-style" className="text-cyber-cyan tracking-wide">
                  Card Frame Style
                </Label>
                <Select value={fields.frameStyle} onValueChange={(value) => setFields({ ...fields, frameStyle: value })}>
                  <SelectTrigger className="bg-cyber-darker/50 border-cyber-cyan/30 text-white focus:border-cyber-cyan">
                    <SelectValue placeholder="Select a frame style">
                      {fields.frameStyle && FRAME_STYLES.find(s => s.id === fields.frameStyle)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-dark border-cyber-cyan/30 max-w-[--radix-select-trigger-width] [&>[data-radix-select-viewport]]:pr-1.5">
                    {FRAME_STYLES.map((style, index) => (
                      <SelectItem 
                        key={style.id} 
                        value={style.id}
                        className={`text-white hover:bg-cyber-cyan/20 hover:text-white focus:bg-cyber-cyan/20 focus:text-white data-[state=checked]:bg-cyber-cyan/20 data-[state=checked]:text-white group rounded-md !pr-6 ${index < FRAME_STYLES.length - 1 ? 'mb-1' : ''}`}
                      >
                        <span className="sr-only">{style.name}</span>
                        <div className="py-0.5">
                          <div className="font-semibold">{style.name}</div>
                          <div className="text-xs text-gray-400 whitespace-normal group-hover:text-gray-300 group-data-[state=checked]:text-gray-300">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-text" className="text-cyber-cyan tracking-wide">
                  Additional Text
                </Label>
                <Input
                  id="additional-text"
                  placeholder="e.g., Guardian of the Ancient Realm, Creature - Dragon"
                  value={fields.additionalText}
                  onChange={(e) => setFields({ ...fields, additionalText: e.target.value })}
                  className="bg-cyber-darker/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                />
              </div>


            </div>

            {/* Generated Prompt */}
            <div className="space-y-2">
              <Label className="text-cyber-pink tracking-wide flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Generated Prompt
              </Label>
              <Textarea
                value={prompt || "Fill in the fields above to generate your prompt..."}
                readOnly
                className="min-h-[150px] bg-cyber-darker/50 border-cyber-pink/30 text-white font-mono text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyPrompt}
                  disabled={!prompt}
                  className="flex-1 cyber-button tracking-wider"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedPrompt ? "Copied!" : "Copy Prompt"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="bg-cyber-dark border-2 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:text-cyber-cyan tracking-wider"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* AI Tools */}
            <div className="space-y-2">
              <Label className="text-cyber-cyan tracking-wide">
                Use your prompt with:
              </Label>
              {/* Warning message */}
              <div className="bg-cyber-pink/10 border border-cyber-pink/30 rounded-lg p-3 mb-3">
                <p className="text-cyber-pink text-sm font-semibold tracking-wide text-center">
                  ⚠️ ALWAYS GENERATE EACH PROMPT WITH A NEW CHAT INSTANCE FOR BEST RESULTS
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={(e) => {
                      e.preventDefault()
                      // Use window.open with specific window name to prevent multiple windows
                      window.open(tool.url, '_blank', 'noopener,noreferrer')
                    }}
                    className={`flex items-center justify-center gap-2 p-4 bg-cyber-darker/50 border border-cyber-cyan/30 rounded-lg text-white hover:bg-cyber-cyan/10 transition-all ${tool.color} w-full`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tool.icon}</span>
                      <span className="font-semibold">{tool.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </TabsContent>

          <TabsContent value="examples" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAMPLE_STYLES.map((example) => (
                <Card key={example.id} className="bg-cyber-darker/50 border-cyber-cyan/30 overflow-hidden">
                  <div className="aspect-[2.5/3.5] bg-cyber-darker/80 relative pt-6 sm:pt-4 px-4 sm:px-2 pb-4 sm:pb-2 flex items-center justify-center">
                    <img 
                      src={example.image} 
                      alt={example.name}
                      className="max-w-full max-h-full rounded-2xl shadow-lg"
                    />
                  </div>
                  <CardContent className="px-4 pt-2 pb-4">
                    <Button
                      onClick={() => handleUseExample(example)}
                      className="w-full cyber-button tracking-wider"
                    >
                      Use This Style
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}