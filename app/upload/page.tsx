"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { UploadArea } from "@/components/upload-area"
import { FlippableCardPreview } from "@/components/flippable-card-preview"
import { AIGenerationModal } from "@/components/ai-generation-modal"
import { CustomCardCheckoutModal } from "@/components/custom-card-checkout-modal"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { Upload, AlertCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { cropImageToAspectRatio } from "@/lib/image-processing"
import { uploadToSupabase } from "@/lib/upload"
import { canCreateMore, incrementGuestCreation, getRemaining, FREE_LIMIT } from "@/lib/guest-quota"
import { getSupabaseBrowserClient, signInWithGoogle } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>("/example-card_cardify.webp")
  const [processedImageBlob, setProcessedImageBlob] = useState<Blob | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingToDatabase, setIsUploadingToDatabase] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [showAIModal, setShowAIModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [showLegalDetails, setShowLegalDetails] = useState(false)
  const [hasShownAIModal, setHasShownAIModal] = useState(() => {
    // Check sessionStorage to see if we've already shown the AI modal in this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('cardify-ai-modal-shown') === 'true'
    }
    return false
  })
  const isNavVisible = useNavigationVisibility()
  
  // Mouse tracking for custom tooltip
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const desktopButtonRef = useRef<HTMLDivElement>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [user, setUser] = useState<any>(null)
const { toast } = useToast()
// near other state
const [remaining, setRemaining] = useState<number>(getRemaining())
// add near other state
const [credits, setCredits] = useState<number>(0)

// fetch + subscribe to mkt_profiles.credits
useEffect(() => {
  const sb = getSupabaseBrowserClient()

  // initial fetch
  const init = async () => {
    const { data: { user } } = await sb.auth.getUser()
    if (!user?.id) { setCredits(0); return }
    const { data } = await sb
      .from("mkt_profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle()
    setCredits(Number(data?.credits ?? 0))
  }
  init()

  // realtime for this user
  let sub: ReturnType<typeof sb.channel> | null = null
  const run = async () => {
    const { data: { user } } = await sb.auth.getUser()
    if (!user?.id) return
    sub = sb
      .channel(`credits-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mkt_profiles", filter: `id=eq.${user.id}` },
        async () => {
          const { data } = await sb
            .from("mkt_profiles")
            .select("credits")
            .eq("id", user.id)
            .maybeSingle()
          setCredits(Number(data?.credits ?? 0))
        }
      )
      .subscribe()
  }
  run()

  return () => { if (sub) sb.removeChannel(sub) }
}, [])


useEffect(() => {
  const onUpdate = () => setRemaining(getRemaining())
  window.addEventListener("cardify-free-updated", onUpdate)
  window.addEventListener("storage", onUpdate)
  return () => {
    window.removeEventListener("cardify-free-updated", onUpdate)
    window.removeEventListener("storage", onUpdate)
  }
}, [])


useEffect(() => {
  const supabase = getSupabaseBrowserClient()
  supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
    setUser(session?.user ?? null)
  })
  return () => sub.subscription.unsubscribe()
}, [])


  // Clean up object URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage)
      }
    }
  }, [uploadedImage])

  // Clean up tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  // Show AI modal only on first visit
  useEffect(() => {
    if (!hasShownAIModal) {
      setShowAIModal(true)
    }
  }, [hasShownAIModal])

  // Handle mouse movement for tooltip
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!uploadedImage || !hasAgreed) {
      // Clear any existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      
      setShowTooltip(true)
      // Small delay for smooth fade in
      setTimeout(() => {
        setTooltipVisible(true)
      }, 10)
      
      document.addEventListener('mousemove', handleMouseMove)
    }
  }, [uploadedImage, hasAgreed, handleMouseMove])

  const handleMouseLeave = useCallback(() => {
    // Start fade out
    setTooltipVisible(false)
    
    // Remove tooltip after fade animation completes
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false)
    }, 150) // Match the transition duration
    
    document.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setFileName(file.name)
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB")
    setUploadProgress(0)

    try {
      // Create preview URL immediately for fast feedback
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Process the image in the background to match card aspect ratio
      let progressInterval: NodeJS.Timeout | null = null
      
      // Start progress animation
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            // Hold at 90% while processing
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Crop image to card aspect ratio (2.5:3.5)
      const croppedBlob = await cropImageToAspectRatio(file)
      setProcessedImageBlob(croppedBlob)

      // Complete the progress
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setUploadProgress(100)
      
      setTimeout(() => {
        setIsUploading(false)
      }, 500)
      
    } catch (error) {
      console.error('Error processing image:', error)
      // Fall back to using the original file if processing fails
      setProcessedImageBlob(file)
      setIsUploading(false)
      setUploadProgress(100)
      
      // Optionally show an error message
      console.warn('Image processing failed, using original image')
    }
  }, [])

  // Tooltip message
  const getTooltipMessage = () => {
    if (!uploadedImage && !hasAgreed) {
      return "Upload artwork and check the box to continue"
    } else if (!uploadedImage) {
      return "Please upload an image first"
    } else {
      return "☝ Agree to terms above"
    }
  }

const handleFinalizeClick = async () => {
  if (!uploadedImage || !hasAgreed) return

  // guests: keep your existing gating
  if (!user && !canCreateMore()) {
    toast({ title: "Sign in required", description: "You’ve used your 3 free creations. Sign in to continue." })
    signInWithGoogle("/upload")
    return
  }

  // if signed-in and no credits, route to buy
  if (user && credits <= 0) {
    toast({ title: "No credits", description: "Buy credits to continue." })
    window.location.href = "/credits"
    return
  }

  setIsUploadingToDatabase(true)
  setUploadError(null)

  try {
    // uploads (this is where the DB trigger will deduct 1 credit)
    if (!uploadedImageUrl && processedImageBlob) {
      const uploadData = await uploadToSupabase(processedImageBlob)
      setUploadedImageUrl(uploadData.publicUrl)
    } else if (!uploadedImageUrl && uploadedImage) {
      const imageBlob = await fetch(uploadedImage).then(r => r.blob())
      const uploadData = await uploadToSupabase(imageBlob)
      setUploadedImageUrl(uploadData.publicUrl)
    }

    // guests consume free quota on success (unchanged)
    if (!user) {
      incrementGuestCreation()
      setRemaining(getRemaining())
      toast({ title: "Created!", description: `You have ${getRemaining()} of ${FREE_LIMIT} free remaining.` })
    }

    setShowCheckoutModal(true)
  } catch (error: any) {
    const msg = String(error?.message || error)
    if (msg.includes("no_credits") || msg.includes("insufficient_credits")) {
      // keep storage cleaned (upload.ts already tries remove on failure)
      toast({ title: "No credits", description: "Buy credits to continue." })
      // flip UI to Buy Credits state by leaving credits as-is (0)
    } else {
      console.error("❌ Failed to upload image:", error)
      setUploadError('Failed to upload image. Please try again.')
    }
  } finally {
    setIsUploadingToDatabase(false)
  }
}



  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
        {/* Background Effects */}
        <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navigation />

      {/* AI Generation Modal */}
      <AIGenerationModal 
        isOpen={showAIModal} 
        onClose={() => {
          setShowAIModal(false)
          setHasShownAIModal(true)
          // Persist to sessionStorage so it won't show again after reload in this session
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('cardify-ai-modal-shown', 'true')
          }
        }} 
      />

      {/* Custom Card Checkout Modal */}
      <CustomCardCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false)
          // Reset states instead of reloading
          setUploadedImageUrl(null)
          setUploadError(null)
        }}
        uploadedImage={uploadedImage}
        processedImageBlob={processedImageBlob}
        uploadedImageUrl={uploadedImageUrl}
      />

      <div className="px-6 py-8 pt-24 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
       <div className="flex items-center gap-2">
  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wider">Upload Your Own Artwork</h1>
{!user && (
  <span className="text-xs px-2 py-0.5 rounded border border-cyber-cyan/40 text-cyber-cyan">
    {remaining} / {FREE_LIMIT} free
  </span>
)}

</div>

            <Button
              onClick={() => setShowAIModal(true)}
              className="cyber-button w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Prompt Generator
            </Button>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Upload Section */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              {/* Upload Area */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30 flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 tracking-wider text-lg">
                    <Upload className="w-5 h-5 text-cyber-cyan" />
                    Upload Artwork
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1.5 ml-7">
                    Need artwork? Try Canva or Photoshop (1200×1680px min recommended) or our{" "}
                    <button 
                      onClick={() => setShowAIModal(true)}
                      className="text-cyber-cyan hover:text-cyber-pink underline transition-colors"
                    >
                      AI Prompt Generator
                    </button>{" "}
                    with ChatGPT
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-3">
                  <UploadArea 
                    onFileUpload={handleFileUpload} 
                    disabled={isUploading}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    fileName={fileName}
                    fileSize={fileSize}
                    uploadedImage={uploadedImage}
                  />
                </CardContent>
              </Card>

              {/* Card Preview - Mobile only, shown after upload area */}
              <div className="lg:hidden">
                <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white tracking-wider">Card Preview</CardTitle>
                    <p className="text-gray-400 text-sm">Hover to see the back of your card</p>
                  </CardHeader>
                  <CardContent>
                    <FlippableCardPreview artwork={uploadedImage} />
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons - Desktop only */}
              <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-green/30 hidden lg:block">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Legal Agreement */}
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <Checkbox 
                        checked={hasAgreed}
                        onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                        className="h-4 w-4 mt-0.5 border-2 border-cyber-cyan data-[state=checked]:bg-cyber-cyan data-[state=checked]:border-cyber-cyan data-[state=checked]:text-black flex-shrink-0"
                      />
                      <span className="text-xs text-gray-300 leading-relaxed">
                        I confirm I have rights to use this content and agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="/dmca" target="_blank" rel="noopener noreferrer" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                          DMCA Policy
                        </a>
                        .{" "}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowLegalDetails(!showLegalDetails)
                          }}
                          className="text-gray-400 hover:text-cyber-cyan ml-0.5 transition-colors text-[11px] border border-gray-600 hover:border-cyber-cyan px-1.5 py-0.5 rounded"
                        >
                          {showLegalDetails ? '− less' : '+ more'}
                        </button>
                      </span>
                    </label>
                    {showLegalDetails && (
                      <div className="text-xs text-gray-400 bg-cyber-dark/50 p-2 rounded border border-cyber-cyan/10">
                        <p className="flex items-start gap-1 mb-1">
                          <span className="text-cyber-yellow">•</span>
                          <span>You own or have licenses to use all content</span>
                        </p>
                        <p className="flex items-start gap-1 mb-1">
                          <span className="text-cyber-yellow">•</span>
                          <span>Your content doesn't infringe copyrights, trademarks, or IP</span>
                        </p>
                        <p className="flex items-start gap-1">
                          <span className="text-cyber-yellow">•</span>
                          <span>Your content doesn't contain unauthorized likenesses</span>
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-cyber-cyan/10">
                          Violations may result in account suspension and legal action.
                        </p>
                      </div>
                    )}
                    
                    {/* Finalize Button */}
                    <div 
                      ref={desktopButtonRef}
                      className="flex flex-col sm:flex-row gap-4 pt-1"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
<Button
  disabled={
    !uploadedImage ||
    !hasAgreed ||
    isUploadingToDatabase ||
    (!user && !canCreateMore())
  }
  onClick={() => {
    if (user && credits <= 0) {
      window.location.href = "/credits"
    } else {
      handleFinalizeClick()
    }
  }}
  className={`w-full text-lg py-6 tracking-wider transition-all duration-300 ${
    uploadedImage && hasAgreed && (user || canCreateMore())
      ? "cyber-button"
      : "bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed opacity-50"
  }`}
  title={
    !user && !canCreateMore()
      ? "Free limit reached — sign in to continue"
      : user && credits <= 0
        ? "No credits — buy to continue"
        : getTooltipMessage()
  }
>
  {isUploadingToDatabase ? (
    <>
      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      Uploading...
    </>
  ) : user && credits <= 0 ? (
    <>Buy Credits</>
  ) : (
    <>
      Finalize
      <ArrowRight className="w-5 h-5 ml-2" />
    </>
  )}
</Button>


                    </div>
                    {uploadError && (
                      <div className="text-xs text-red-400 bg-red-900/20 border border-red-400/30 rounded px-2 py-1 mt-2">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Card Preview (Desktop only) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className={`sticky transition-all duration-300 ease-in-out ${isNavVisible ? "top-24" : "top-4"}`}>
                <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white tracking-wider">Card Preview</CardTitle>
                    <p className="text-gray-400 text-sm">Hover to see the back of your card</p>
                  </CardHeader>
                  <CardContent>
                    <FlippableCardPreview artwork={uploadedImage} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile only */}
          <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-green/30 lg:hidden mt-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Legal Agreement */}
                <label className="flex items-start gap-2 cursor-pointer group">
                  <Checkbox 
                    checked={hasAgreed}
                    onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                    className="h-4 w-4 mt-0.5 border-2 border-cyber-cyan data-[state=checked]:bg-cyber-cyan data-[state=checked]:border-cyber-cyan data-[state=checked]:text-black flex-shrink-0"
                  />
                  <span className="text-xs text-gray-300 leading-relaxed">
                    I confirm I have rights to use this content and agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="/dmca" target="_blank" rel="noopener noreferrer" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                      DMCA Policy
                    </a>
                    .{" "}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowLegalDetails(!showLegalDetails)
                      }}
                      className="text-gray-400 hover:text-cyber-cyan ml-0.5 transition-colors text-[11px] border border-gray-600 hover:border-cyber-cyan px-1.5 py-0.5 rounded"
                    >
                      {showLegalDetails ? '− less' : '+ more'}
                    </button>
                  </span>
                </label>
                {showLegalDetails && (
                  <div className="text-xs text-gray-400 bg-cyber-dark/50 p-2 rounded border border-cyber-cyan/10">
                    <p className="flex items-start gap-1 mb-1">
                      <span className="text-cyber-yellow">•</span>
                      <span>You own or have licenses to use all content</span>
                    </p>
                    <p className="flex items-start gap-1 mb-1">
                      <span className="text-cyber-yellow">•</span>
                      <span>Your content doesn't infringe copyrights, trademarks, or IP</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <span className="text-cyber-yellow">•</span>
                      <span>Your content doesn't contain unauthorized likenesses</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-cyber-cyan/10">
                      Violations may result in account suspension and legal action.
                    </p>
                  </div>
                )}
                
                {/* Finalize Button */}
                <div className="flex flex-col sm:flex-row gap-4">
      <Button
  disabled={!uploadedImage || !hasAgreed || isUploadingToDatabase || (!user && !canCreateMore())}
  onClick={() => {
    if (user && credits <= 0) {
      window.location.href = "/credits"
    } else {
      handleFinalizeClick()
    }
  }}
  className={`w-full text-lg py-6 tracking-wider transition-all duration-300 ${
    uploadedImage && hasAgreed && (user || canCreateMore())
      ? "cyber-button"
      : "bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed opacity-50"
  }`}
  title={
    !user && !canCreateMore()
      ? "Free limit reached — sign in to continue"
      : user && credits <= 0
        ? "No credits — buy to continue"
        : getTooltipMessage()
  }
>
  {isUploadingToDatabase ? (
    <>
      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      Uploading...
    </>
  ) : user && credits <= 0 ? (
    <>Buy Credits</>
  ) : (
    <>
      Finalize
      <ArrowRight className="w-5 h-5 ml-2" />
    </>
  )}
</Button>

                </div>
                {uploadError && (
                  <div className="text-xs text-red-400 bg-red-900/20 border border-red-400/30 rounded px-2 py-1 mt-2">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    {uploadError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <footer className="px-6 py-8 mt-16 border-t border-cyber-cyan/20 bg-cyber-dark/40">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Cardify. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Custom Mouse-Following Tooltip */}
      {showTooltip && (
        <div
          className={`fixed z-50 pointer-events-none transition-opacity duration-150 ease-in-out ${
            tooltipVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
          }}
        >
          <div className="bg-cyber-dark border border-cyber-cyan/50 text-white text-sm px-3 py-2 rounded-md shadow-lg max-w-xs">
            {getTooltipMessage()}
          </div>
        </div>
      )}
    </div>
  )
}