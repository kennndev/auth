"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CardPreviewWithCase from "./CardPreviewWithCaseLazy"
import { ShippingAddressForm, type ShippingAddress } from "./shipping-address-form"
import { Minus, Plus, ShoppingCart, Star, Zap, Shield, AlertCircle, Loader2, Eye, EyeOff, X, ShoppingBag } from "lucide-react"
import { csrfFetch } from "@/lib/csrf-client"
import { useCart } from "@/lib/cart-context"

interface LimitedEditionModalProps {
  isOpen: boolean
  onClose?: () => void
}

// Quantity state management types
interface QuantityState {
  value: number
  error: string | null
  isValid: boolean
}

// Inventory and pricing data types
interface PricingTier {
  quantity: number
  pricePerUnit: number
  totalPrice: number
  discount: number
}

interface InventoryData {
  inventory: number
  pricePerUnit: number
  pricingTiers: PricingTier[]
  displayCases: {
    inventory: number
    pricePerUnit: number
    product: {
      id: string
      name: string
      description: string
      images: string[]
    }
  }
  product: {
    id: string
    name: string
    description: string
    images: string[]
  }
  lastUpdated: string
}

interface InventoryState {
  data: InventoryData | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
}

// Configuration constants
const QUANTITY_CONFIG = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 1,
} as const

const POLLING_CONFIG = {
  INTERVAL: 30000, // 30 seconds
  ERROR_RETRY_INTERVAL: 10000, // 10 seconds for error retry
} as const

// Storage key for persisting quantity state
const QUANTITY_STORAGE_KEY = 'cardify-limited-edition-quantity'

// Create a static card preview component specifically for the limited edition
function LimitedEditionCardPreview() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const touchStartRef = useRef(false)

  // Screen size detection for performance optimizations
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    
    if (typeof window !== 'undefined') {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Detect touch capability on mount and play intro animation
  useEffect(() => {
    const checkTouchSupport = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    setIsTouchDevice(checkTouchSupport())
    
    // Start intro animation sequence
    setTimeout(() => {
      setIsLoaded(true)
      // Mark intro as played after animation completes
      setTimeout(() => {
        setHasIntroPlayed(true)
      }, 1000)
    }, 100)
  }, [])

  const handleCardInteraction = () => {
    setIsFlipped(!isFlipped)
  }

  const handleTouchStart = () => {
    touchStartRef.current = true
    handleCardInteraction()
  }

  const handleMouseEnter = () => {
    // Only respond to mouse events if no recent touch occurred and not a touch device
    if (!touchStartRef.current && !isTouchDevice) {
      setIsFlipped(true)
    }
  }

  const handleMouseLeave = () => {
    // Only respond to mouse events if no recent touch occurred and not a touch device
    if (!touchStartRef.current && !isTouchDevice) {
      setIsFlipped(false)
    }
  }

  const handleClick = () => {
    // Reset touch flag after a short delay to allow mouse events to work again
    if (touchStartRef.current) {
      setTimeout(() => {
        touchStartRef.current = false
      }, 300)
    }
    // For non-touch devices, handle click as toggle
    if (!isTouchDevice) {
      handleCardInteraction()
    }
  }

  return (
    <div className="relative w-full mx-auto font-mono">
      {/* Card Container with 3D flip effect - Standard playing card ratio 2.5:3.5 */}
      <div
        className={`relative w-full cursor-pointer mx-auto touch-manipulation limited-edition-card-container transition-all duration-700 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          ...(isSmallScreen ? {} : { perspective: "1000px" }),
          aspectRatio: "2.5 / 3.5",
          maxWidth: "600px"
        }}
        onMouseEnter={hasIntroPlayed ? handleMouseEnter : undefined}
        onMouseLeave={hasIntroPlayed ? handleMouseLeave : undefined}
        onClick={hasIntroPlayed ? handleClick : undefined}
        onTouchStart={hasIntroPlayed ? handleTouchStart : undefined}
      >
        <div
          className={
            isSmallScreen
              ? "relative w-full h-full"
              : `relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                } ${isLoaded && !hasIntroPlayed ? "animate-spin-intro" : ""}`
          }
          style={
            isSmallScreen 
              ? {} 
              : {
                  // Force 3D transform context from the start to prevent initial pixelation
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  willChange: 'transform'
                }
          }
        >
          {/* Front of Card - Clean Design with User's Image */}
          <div className={
            isSmallScreen 
              ? `absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isFlipped ? "opacity-0" : "opacity-100"
                }`
              : "absolute inset-0 w-full h-full backface-hidden"
          }>
            <div className="relative w-full h-full rounded-xl border-2 border-cyber-cyan/50 shadow-2xl overflow-hidden">
              {/* User's provided image as the card front */}
              <img
                src="/Panther_v7_Pinkhair_FLAT.jpg"
                alt="Limited Edition Card"
                className="w-full h-full object-cover rounded-xl image-high-quality"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              />
              
              {/* Rainbow Foil Effect Overlay */}
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                {/* Primary rainbow foil bands - hidden on small screens for performance */}
                {!isSmallScreen && <div 
                  className="absolute opacity-60 mix-blend-overlay"
                  style={{
                    top: '-50%',
                    bottom: '-50%',
                    left: '-50%',
                    right: '-50%',
                    background: `
                      repeating-linear-gradient(
                        45deg,
                        rgba(255, 0, 0, 0.3) 0px,
                        rgba(255, 154, 0, 0.3) 15px,
                        rgba(255, 255, 0, 0.3) 30px,
                        rgba(0, 255, 0, 0.3) 45px,
                        rgba(0, 255, 255, 0.3) 60px,
                        rgba(0, 0, 255, 0.3) 75px,
                        rgba(255, 0, 255, 0.3) 90px,
                        rgba(255, 0, 0, 0.3) 105px
                      )
                    `,
                    animation: 'rainbowShift 15s ease-in-out infinite',
                    animationDelay: '0s',
                    animationFillMode: 'both',
                    willChange: 'transform',
                    transform: 'translate3d(-50px, 0, 0) skewX(0deg)',
                    backfaceVisibility: 'hidden'
                  }}
                />}
                
                {/* Secondary rainbow layer for depth - hidden on small screens for performance */}
                {!isSmallScreen && <div 
                  className="absolute opacity-40 mix-blend-soft-light"
                  style={{
                    top: '-50%',
                    bottom: '-50%',
                    left: '-50%',
                    right: '-50%',
                    background: `
                      repeating-linear-gradient(
                        125deg,
                        rgba(255, 0, 128, 0.2) 0px,
                        rgba(0, 255, 255, 0.2) 25px,
                        rgba(255, 255, 0, 0.2) 50px,
                        rgba(138, 43, 226, 0.2) 75px,
                        rgba(0, 255, 65, 0.2) 100px,
                        rgba(255, 0, 128, 0.2) 125px
                      )
                    `,
                    animation: 'rainbowShift 12s ease-in-out infinite reverse',
                    animationDelay: '0.1s',
                    animationFillMode: 'both',
                    willChange: 'transform',
                    transform: 'translate3d(-50px, 0, 0) skewX(0deg)',
                    backfaceVisibility: 'hidden'
                  }}
                />}
                
                {/* Enhanced prismatic shine - GPU optimized */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    background: `
                      linear-gradient(
                        75deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.1) 12%,
                        rgba(255, 255, 255, 0.2) 18%,
                        transparent 25%,
                        transparent 75%,
                        rgba(255, 255, 255, 0.2) 82%,
                        rgba(255, 255, 255, 0.1) 88%,
                        transparent 100%
                      )
                    `,
                    animation: 'prismaticShine 12s ease-in-out infinite',
                    animationDelay: '0.2s',
                    animationFillMode: 'both',
                    willChange: 'transform',
                    transform: 'translate3d(-200%, 0, 0) skewX(-15deg)',
                    backfaceVisibility: 'hidden'
                  }}
                />
                
                {/* Holographic spots - GPU optimized with selective intensity */}
                <div 
                  className="absolute inset-0 opacity-90"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 20%, rgba(255, 0, 255, 0.5) 0%, transparent 25%),
                      radial-gradient(circle at 70% 80%, rgba(0, 255, 255, 0.5) 0%, transparent 25%),
                      radial-gradient(circle at 80% 30%, rgba(255, 255, 0, 0.3) 0%, transparent 25%),
                      radial-gradient(circle at 20% 70%, rgba(0, 255, 0, 0.35) 0%, transparent 25%)
                    `,
                    animation: 'holographicSpots 18s ease-in-out infinite',
                    animationDelay: '0.3s',
                    animationFillMode: 'both',
                    willChange: 'transform',
                    transform: 'scale3d(1.8, 1.8, 1) rotate(0deg)',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div className={
            isSmallScreen
              ? `absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isFlipped ? "opacity-100" : "opacity-0"
                }`
              : "absolute inset-0 w-full h-full backface-hidden rotate-y-180"
          }>
            <div className="relative w-full h-full rounded-xl border-2 border-cyber-pink/50 shadow-2xl cyber-card-glow-gradient overflow-hidden">
              {/* Static image for the back of the card */}
              <img
                src="/redbackbleed111111.jpg"
                alt="Limited Edition Card Back"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
              
              {/* Limited Edition overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/10 via-transparent to-cyber-purple/10 rounded-xl" />
              
              {/* Back Label */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-xs text-cyber-pink font-bold tracking-wider z-10">
                LIMITED
              </div>

              {/* Scanlines - Disabled on mobile for performance */}
              {!isSmallScreen && <div className="absolute inset-0 scanlines opacity-20 rounded-xl" />}
            </div>
          </div>
        </div>
      </div>

      {/* Flip Instruction - Mobile-friendly */}
      <div className={`text-center mt-4 transition-opacity duration-500 ${hasIntroPlayed ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-xs text-gray-400 tracking-wide">
          {isFlipped ? "Showing card back" : isTouchDevice ? "Tap to flip card" : "Tap or hover to flip card"}
        </p>
      </div>
    </div>
  )
}

export function LimitedEditionModal({ isOpen, onClose }: LimitedEditionModalProps) {
  // State for smooth closing animation
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Cart functionality
  const { addItem } = useCart()
  const [showAddedToCart, setShowAddedToCart] = useState(false)

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

  // localStorage utility functions for quantity persistence
  const saveQuantityToStorage = (quantity: number) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUANTITY_STORAGE_KEY, quantity.toString())
      }
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., storage quota exceeded, incognito mode)
      console.warn('Failed to save quantity to localStorage:', error)
    }
  }

  const loadQuantityFromStorage = (): number => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(QUANTITY_STORAGE_KEY)
        if (saved) {
          const parsedQuantity = parseInt(saved, 10)
          // Validate the stored value before using it
          if (!isNaN(parsedQuantity) && 
              parsedQuantity >= QUANTITY_CONFIG.MIN && 
              parsedQuantity <= QUANTITY_CONFIG.MAX) {
            return parsedQuantity
          }
        }
      }
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn('Failed to load quantity from localStorage:', error)
    }
    // Return default value if loading fails or value is invalid
    return QUANTITY_CONFIG.DEFAULT
  }

  const clearQuantityFromStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(QUANTITY_STORAGE_KEY)
      }
    } catch (error) {
      console.warn('Failed to clear quantity from localStorage:', error)
    }
  }

  // Enhanced quantity state management with persistence
  const [quantityState, setQuantityState] = useState<QuantityState>(() => {
    // Load persisted quantity on initialization
    const persistedQuantity = loadQuantityFromStorage()
    return {
      value: persistedQuantity,
      error: null,
      isValid: true,
    }
  })

  // Inventory state management
  const [inventoryState, setInventoryState] = useState<InventoryState>({
    data: null,
    loading: true,
    error: null,
    lastFetched: null,
  })
  
  const [isOrdering, setIsOrdering] = useState(false)
  
  // Display case state management
  const [includeDisplayCase, setIncludeDisplayCase] = useState(false)
  const [displayCaseQuantity, setDisplayCaseQuantity] = useState(1)
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<'quantity' | 'shipping'>('quantity')
  
  // 3D preview state management
  const [showCase3DPreview, setShowCase3DPreview] = useState(false)
  
  // Screen size detection for mobile optimizations
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [fadeTransition, setFadeTransition] = useState({
    isTransitioning: false,
    show3D: false
  })
  const [isMobile, setIsMobile] = useState(false)
  const [mobilePreviewActive, setMobilePreviewActive] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Request deduplication and cancellation for race condition prevention
  const activeRequestRef = useRef<AbortController | null>(null)

  // Detect screen size for performance optimizations  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    
    if (typeof window !== 'undefined') {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Detect mobile/tablet devices to disable hover effects
  useEffect(() => {
    const checkIsMobile = () => {
      return window.innerWidth < 1024 || 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    
    setIsMobile(checkIsMobile())
    
    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Optimized 3D preview handlers with responsive transitions
  const handleShow3DPreview = () => {
    if (isSoldOut) return
    if (isMobile && !mobilePreviewActive) return
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Small delay on hover in to prevent flickering from rapid mouse movements
    hoverTimeoutRef.current = setTimeout(() => {
      setAnimationKey(prev => prev + 1) // Restart 3D animation
      setFadeTransition({ isTransitioning: true, show3D: true })
      setTimeout(() => {
        setShowCase3DPreview(true)
        setFadeTransition({ isTransitioning: false, show3D: true })
      }, 150) // Reduced delay for faster response
    }, 100) // Small debounce delay
  }

  const handleHide3DPreview = () => {
    if (isMobile && mobilePreviewActive) return // Don't hide on mobile when actively previewing
    if (includeDisplayCase) return // Don't hide when display case is selected
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Immediate response on hover off for better UX
    setFadeTransition({ isTransitioning: true, show3D: false })
    setTimeout(() => {
      setShowCase3DPreview(false)
      setFadeTransition({ isTransitioning: false, show3D: false })
    }, 150) // Reduced delay for faster response
  }

  // Mobile-specific tap to preview handler
  const handleMobilePreviewTap = () => {
    if (!isMobile || isSoldOut) return
    
    setMobilePreviewActive(!mobilePreviewActive)
    
    if (!mobilePreviewActive) {
      // Show preview
      setAnimationKey(prev => prev + 1) // Restart 3D animation
      setFadeTransition({ isTransitioning: true, show3D: true })
      setTimeout(() => {
        setShowCase3DPreview(true)
        setFadeTransition({ isTransitioning: false, show3D: true })
      }, 300)
    } else {
      // Hide preview
      setFadeTransition({ isTransitioning: true, show3D: false })
      setTimeout(() => {
        setShowCase3DPreview(false)
        setFadeTransition({ isTransitioning: false, show3D: false })
      }, 300)
    }
  }
  const isRequestInProgressRef = useRef<boolean>(false)

  // Fetch inventory data from API with race condition prevention
  const fetchInventoryData = async (showLoading = false) => {
    // Prevent concurrent requests - deduplication
    if (isRequestInProgressRef.current) {
      console.log('Inventory request already in progress, skipping duplicate request')
      return
    }

    // Cancel any existing request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    activeRequestRef.current = abortController
    isRequestInProgressRef.current = true

    try {
      if (showLoading) {
        setInventoryState(prev => ({ ...prev, loading: true, error: null }))
      }

      const response = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal, // Add cancellation support
      })

      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log('Inventory request was cancelled')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch inventory`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory data')
      }

      // Only update state if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setInventoryState({
          data: result.data,
          loading: false,
          error: null,
          lastFetched: new Date(),
        })

        // Update quantity limits based on available inventory
        const maxAllowedQuantity = Math.min(QUANTITY_CONFIG.MAX, result.data.inventory)
        if (quantityState.value > maxAllowedQuantity) {
          const newQuantityState = validateQuantity(maxAllowedQuantity)
          setQuantityState(newQuantityState)
          saveQuantityToStorage(newQuantityState.value)
        }
      }

    } catch (error) {
      // Don't update state if request was aborted (not a real error)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Inventory request was aborted')
        return
      }

      console.error('Error fetching inventory:', error)
      if (!abortController.signal.aborted) {
        setInventoryState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load inventory',
          lastFetched: new Date(),
        }))
      }
    } finally {
      // Clean up request state
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null
      }
      isRequestInProgressRef.current = false
    }
  }

  // Set up polling for real-time inventory updates
  useEffect(() => {
    if (!isOpen) return

    // Initial fetch
    fetchInventoryData(true)

    // Set up polling interval
    const startPolling = () => {
      pollingIntervalRef.current = setInterval(() => {
        fetchInventoryData(false) // Don't show loading indicator for background updates
      }, inventoryState.error ? POLLING_CONFIG.ERROR_RETRY_INTERVAL : POLLING_CONFIG.INTERVAL)
    }

    startPolling()

    // Cleanup polling and requests on unmount or modal close
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      
      // Cancel any active requests and reset request state
      if (activeRequestRef.current) {
        activeRequestRef.current.abort()
        activeRequestRef.current = null
      }
      isRequestInProgressRef.current = false
      
      // Cleanup hover timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      
      // Reset mobile preview state when modal closes
      setMobilePreviewActive(false)
      setShowCase3DPreview(false)
      setFadeTransition({ isTransitioning: false, show3D: false })
    }
  }, [isOpen, inventoryState.error])

  // Get current pricing information based on quantity
  const getCurrentPricing = () => {
    if (!inventoryState.data) {
      return {
        pricePerUnit: 25, // Fallback price
        totalPrice: 25 * quantityState.value,
        discount: 0,
        savings: 0,
      }
    }

    // Find the best pricing tier for current quantity
    const applicableTiers = inventoryState.data.pricingTiers.filter(
      tier => quantityState.value >= tier.quantity
    )
    
    const bestTier = applicableTiers.length > 0 
      ? applicableTiers[applicableTiers.length - 1] // Get the highest quantity tier applicable
      : inventoryState.data.pricingTiers[0] // Fallback to base price

    const pricePerUnit = bestTier.pricePerUnit
    const cardsTotalPrice = pricePerUnit * quantityState.value
    const originalPrice = inventoryState.data.pricePerUnit * quantityState.value
    const savings = originalPrice - cardsTotalPrice

    // Add display case pricing if included
    const displayCasePrice = inventoryState.data.displayCases?.pricePerUnit || 19.00
    const displayCaseTotalPrice = includeDisplayCase ? (displayCasePrice * displayCaseQuantity) : 0
    const totalPrice = cardsTotalPrice + displayCaseTotalPrice

    return {
      pricePerUnit,
      totalPrice,
      cardsTotalPrice,
      displayCaseTotalPrice,
      discount: bestTier.discount,
      savings,
    }
  }

  const currentPricing = getCurrentPricing()
  const maxQuantity = inventoryState.data 
    ? Math.min(QUANTITY_CONFIG.MAX, inventoryState.data.inventory)
    : QUANTITY_CONFIG.MAX
  const isSoldOut = inventoryState.data ? inventoryState.data.inventory <= 0 : false

  // Initialize and validate quantity state
  // const initializeQuantityState = (initialValue: number = QUANTITY_CONFIG.DEFAULT): QuantityState => {
  //   const value = Math.max(QUANTITY_CONFIG.MIN, Math.min(maxQuantity, initialValue))
  //   return {
  //     value,
  //     error: null,
  //     isValid: true,
  //   }
  // }

  // Validate quantity value and return updated state
  const validateQuantity = (value: number): QuantityState => {
    if (isNaN(value)) {
      return {
        value: quantityState.value, // Keep current value
        error: 'Please enter a valid number',
        isValid: false,
      }
    }

    if (value < QUANTITY_CONFIG.MIN) {
      return {
        value: QUANTITY_CONFIG.MIN,
        error: `Minimum quantity is ${QUANTITY_CONFIG.MIN}`,
        isValid: false,
      }
    }

    if (value > maxQuantity) {
      return {
        value: maxQuantity,
        error: inventoryState.data && inventoryState.data.inventory > 0 
          ? `Only ${inventoryState.data.inventory} cards remaining!`
          : `Maximum quantity is ${maxQuantity}`,
        isValid: false,
      }
    }

    // Valid quantity
    return {
      value,
      error: null,
      isValid: true,
    }
  }

  // Clear quantity validation error
  const clearQuantityError = () => {
    if (quantityState.error) {
      setQuantityState(prev => ({
        ...prev,
        error: null,
        isValid: true,
      }))
    }
  }

  // Derived state for UI controls
  const isIncrementDisabled = quantityState.value >= maxQuantity || isSoldOut
  const isDecrementDisabled = quantityState.value <= QUANTITY_CONFIG.MIN
  const totalPrice = currentPricing.totalPrice.toFixed(2)

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation and escape handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }

      // Tab cycling within modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          // Shift + Tab (backwards)
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab (forwards)
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleQuantityChange = (value: string) => {
    // Clear any existing error when user starts typing
    clearQuantityError()
    
    // Handle empty string case - don't validate yet, let user type
    if (value === '') {
      setQuantityState(prev => ({
        ...prev,
        value: 0, // Temporary invalid state
        error: null,
        isValid: false,
      }))
      return
    }

    // Parse and validate the input
    const numericValue = parseInt(value, 10)
    const newQuantityState = validateQuantity(numericValue)
    
    setQuantityState(newQuantityState)
    
    // Save to localStorage if valid
    if (newQuantityState.isValid) {
      saveQuantityToStorage(newQuantityState.value)
    }
  }

  const incrementQuantity = () => {
    if (isIncrementDisabled) return
    
    const newValue = quantityState.value + 1
    const newQuantityState = validateQuantity(newValue)
    
    setQuantityState(newQuantityState)
    
    if (newQuantityState.isValid) {
      saveQuantityToStorage(newQuantityState.value)
    }
  }

  const decrementQuantity = () => {
    if (isDecrementDisabled) return
    
    const newValue = quantityState.value - 1
    const newQuantityState = validateQuantity(newValue)
    
    setQuantityState(newQuantityState)
    
    if (newQuantityState.isValid) {
      saveQuantityToStorage(newQuantityState.value)
    }
  }

  const handleQuantityKeyDown = (e: React.KeyboardEvent, action: 'increment' | 'decrement') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (action === 'increment') incrementQuantity()
      else decrementQuantity()
    }
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const handleContinueToShipping = () => {
    if (isSoldOut || !quantityState.isValid) return
    setCurrentStep('shipping')
  }
  
  const handleAddToCart = () => {
    if (isSoldOut || !quantityState.isValid || !inventoryState.data) return
    
    const pricing = getCurrentPricing()
    
    addItem({
      type: 'limited-edition',
      name: 'Limited Edition "KOL Legend Series"',
      image: '/Panther_v7_Pinkhair_FLAT.jpg',
      quantity: quantityState.value,
      pricePerUnit: pricing.pricePerUnit,
      includeDisplayCase: includeDisplayCase,
      displayCaseQuantity: displayCaseQuantity,
      displayCasePricePerUnit: inventoryState.data.displayCases?.pricePerUnit || 19.00
    })
    
    // Show confirmation message
    setShowAddedToCart(true)
    setTimeout(() => {
      setShowAddedToCart(false)
      onClose?.()
    }, 1500)
  }

  const handleShippingSubmit = async (address: ShippingAddress) => {
    await handleCreateCheckout(address)
  }

  const handleBackToQuantity = () => {
    setCurrentStep('quantity')
  }

  const handleCreateCheckout = async (address: ShippingAddress) => {
    if (isSoldOut || !quantityState.isValid) return
    
    setIsOrdering(true)
    
    // Enhanced logging context for debugging
    const logContext = {
      quantity: quantityState.value,
      shippingAddress: address,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: crypto.randomUUID?.() || Date.now().toString()
    }
    
    console.log('🛒 Starting checkout process:', logContext)
    
    try {
      // Pre-checkout inventory validation - fetch latest inventory before proceeding
      console.log('📦 Performing pre-checkout inventory validation...', {
        requestedQuantity: quantityState.value,
        currentInventoryState: inventoryState.data?.inventory
      })
      
      const inventoryResponse = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (inventoryResponse.ok) {
        const inventoryResult = await inventoryResponse.json()
        if (inventoryResult.success) {
          const currentInventory = inventoryResult.data.inventory
          
          console.log('📦 Inventory validation result:', {
            currentInventory,
            requestedQuantity: quantityState.value,
            isAvailable: currentInventory >= quantityState.value
          })
          
          // Check if inventory is still sufficient
          if (currentInventory < quantityState.value) {
            const errorMessage = currentInventory <= 0 
              ? 'Sorry, this item is now sold out!'
              : `Sorry, only ${currentInventory} item(s) are now available. Please adjust your quantity.`
            
            console.warn('❌ Insufficient inventory during pre-checkout validation:', {
              requestedQuantity: quantityState.value,
              availableInventory: currentInventory,
              shortfall: quantityState.value - currentInventory
            })
            
            // Update local inventory state
            setInventoryState(prev => ({ 
              ...prev, 
              data: prev.data ? { ...prev.data, ...inventoryResult.data } : inventoryResult.data
            }))
            
            // Adjust quantity if needed
            if (currentInventory > 0 && quantityState.value > currentInventory) {
              const newQuantityState = validateQuantity(currentInventory)
              setQuantityState(newQuantityState)
              saveQuantityToStorage(newQuantityState.value)
              console.log('🔄 Auto-adjusted quantity:', {
                from: quantityState.value,
                to: newQuantityState.value
              })
            }
            
            alert(errorMessage)
            return
          }
        }
      } else {
        console.warn('⚠️ Could not verify inventory before checkout:', {
          status: inventoryResponse.status,
          statusText: inventoryResponse.statusText
        })
        console.log('Proceeding with cached inventory data')
      }

      // Proceed with checkout session creation
      console.log('💳 Creating Stripe checkout session...', {
        quantity: quantityState.value,
        endpoint: '/api/create-checkout-session'
      })
      
      const response = await csrfFetch('/api/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ 
          quantity: quantityState.value,
          includeDisplayCase,
          displayCaseQuantity,
          shippingAddress: address
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        console.error('❌ Checkout session creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorCode: errorData.code,
          errorMessage: errorData.error,
          errorDetails: errorData.details || null,
          availableInventory: errorData.availableInventory || null
        })
        
        // Enhanced error handling based on specific error codes
        let userMessage = 'An unexpected error occurred. Please try again.'
        
        switch (errorData.code) {
          case 'INSUFFICIENT_INVENTORY':
            // Update inventory state with server response
            if (typeof errorData.availableInventory === 'number') {
              setInventoryState(prev => ({
                ...prev,
                data: prev.data ? { ...prev.data, inventory: errorData.availableInventory } : null
              }))
              
              // Adjust quantity if some inventory is still available
              if (errorData.availableInventory > 0) {
                const newQuantityState = validateQuantity(errorData.availableInventory)
                setQuantityState(newQuantityState)
                saveQuantityToStorage(newQuantityState.value)
                console.log('🔄 Auto-adjusted quantity due to insufficient inventory:', {
                  from: quantityState.value,
                  to: newQuantityState.value,
                  availableInventory: errorData.availableInventory
                })
              }
            }
            userMessage = errorData.error || 'Insufficient inventory available'
            break
            
          case 'CSRF_INVALID':
            userMessage = 'Security validation failed. Please refresh the page and try again.'
            console.error('🔒 CSRF validation failed - possible security issue or expired session')
            break
            
          case 'INVALID_QUANTITY':
            userMessage = 'Invalid quantity selected. Please choose a quantity between 1 and 100.'
            break
            
          case 'INVENTORY_CHECK_FAILED':
            userMessage = 'Unable to verify product availability. Please try again in a moment.'
            break
            
          case 'STRIPE_ERROR':
            // Enhanced Stripe error handling with specific details
            console.error('💳 Stripe API error:', {
              stripeDetails: errorData.details,
              originalError: errorData.error
            })
            
            // Parse common Stripe error patterns for better user messaging
            if (errorData.details) {
              if (errorData.details.includes('rate_limit')) {
                userMessage = 'Too many requests. Please wait a moment and try again.'
              } else if (errorData.details.includes('api_key')) {
                userMessage = 'Payment system configuration error. Please contact support.'
                console.error('🚨 Stripe API key issue detected')
              } else if (errorData.details.includes('card')) {
                userMessage = 'Payment method error. Please check your payment details.'
              } else {
                userMessage = 'Payment processing is temporarily unavailable. Please try again later.'
              }
            } else {
              userMessage = 'Payment processing error. Please try again.'
            }
            break
            
          case 'SESSION_CREATION_FAILED':
            userMessage = 'Unable to initialize payment. Please try again.'
            break
            
          case 'METHOD_NOT_ALLOWED':
            userMessage = 'Invalid request method. Please refresh the page and try again.'
            console.error('🚨 HTTP method not allowed - possible client/server version mismatch')
            break
            
          case 'INVALID_JSON':
            userMessage = 'Request format error. Please refresh the page and try again.'
            console.error('🚨 Invalid JSON sent to server - possible client issue')
            break
            
          default:
            // Use server-provided error message as fallback
            userMessage = errorData.error || 'An unexpected error occurred. Please try again.'
            console.error('❓ Unknown error code:', errorData.code)
        }
        
        throw new Error(userMessage)
      }

      const data = await response.json()
      
      console.log('✅ Checkout session created successfully:', {
        sessionId: data.id,
        hasUrl: !!data.url,
        message: data.message
      })
      
      // Clear stored quantity since user is proceeding with checkout
      clearQuantityFromStorage()
      console.log('🧹 Cleared stored quantity from localStorage')
      
      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('🔄 Redirecting to Stripe Checkout...', {
          url: data.url,
          sessionId: data.id
        })
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from payment processor')
      }
    } catch (error) {
      // Enhanced error logging with full context
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
        context: logContext,
        timestamp: new Date().toISOString(),
        userState: {
          quantity: quantityState.value,
          inventoryAvailable: inventoryState.data?.inventory,
          isOrderingState: isOrdering
        }
      }
      
      console.error('💥 Checkout process failed:', errorDetails)
      
      // User-friendly error messaging
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      
      // Enhanced user feedback - using alert for now but could be replaced with toast/modal
      alert(`❌ ${errorMessage}\n\nIf this problem persists, please contact support.`)
      
      // Optional: Track error for analytics (commented out until analytics is implemented)
      // analytics.track('checkout_error', errorDetails)
      
    } finally {
      console.log('🏁 Checkout process completed, resetting loading state')
      setIsOrdering(false)
    }
  }

  // Don't render if modal is not visible
  if (!isVisible) return null

  // Render loading state
  if (inventoryState.loading && !inventoryState.data) {
    return (
      <div 
        className={`fixed inset-0 z-[100] font-mono transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
        {!isSmallScreen && <div className="absolute inset-0 scanlines opacity-20" />}

        <div className="relative h-full flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 bg-cyber-dark/60 backdrop-blur-sm border-2 border-cyber-cyan/30">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Powering up...</h2>
              <p className="text-gray-400">Syncing to the mainframe</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] font-mono transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Overlay Background - Dismissible */}
      <div 
        className={`absolute inset-0 bg-cyber-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`} 
        onClick={handleOverlayClick}
      />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      {/* Scanlines Effect - Disabled on mobile for performance */}
      {!isSmallScreen && <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />}

      {/* Modal Content - Smart responsive centering with scrollability */}
      <div 
        className="relative h-full flex items-start sm:items-center justify-center overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div className={`w-full max-w-6xl px-4 py-4 sm:py-8 lg:py-4 my-auto transition-all duration-300 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <Card 
            className="w-full bg-cyber-dark/60 backdrop-blur-sm border-2 border-cyber-cyan/30 cyber-card-glow-gradient overflow-hidden relative"
            onClick={handleModalClick}
          >
            {/* Cyberpunk Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-md border border-cyber-cyan/50 bg-cyber-dark/80 backdrop-blur-sm 
                         text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20
                         transition-all duration-200 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <CardContent className="p-0">
              {/* Header - Mobile-only reduced spacing */}
              <div className="text-center py-3 sm:py-4 px-4 border-b border-cyber-cyan/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan sm:animate-pulse" />
                  <h1 
                    id="modal-title"
                    className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-wider glitch" 
                    data-text="Limited Edition"
                  >
                    Limited Edition
                  </h1>
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan sm:animate-pulse" />
                </div>
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold mb-1 bg-[linear-gradient(45deg,#00ffff_0%,#ff0080_25%,#00ff41_50%,#8a2be2_75%,#00ffff_100%)] bg-clip-text text-transparent bg-[length:400%_400%] bg-[position:0%_50%] sm:[animation:holographic-shift_3s_ease-in-out_infinite]">
                  &quot;KOL Legend Series&quot;
                </h2>
                <div className="flex items-center justify-center gap-2 text-cyber-pink">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span 
                    id="modal-description"
                    className="text-xs sm:text-base font-semibold"
                  >
                    {inventoryState.data ? (
                      isSoldOut ? (
                        <span className="text-red-400">SOLD OUT!</span>
                      ) : (
                        `Only ${inventoryState.data.inventory} Available`
                      )
                    ) : (
                      `Only ${maxQuantity} Available`
                    )}
                  </span>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                
                {/* Error state indicator */}
                {inventoryState.error && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unable to load live inventory</span>
                  </div>
                )}
              </div>

              {/* Main Content - Mobile-only reduced spacing */}
              <div className="p-3 sm:p-4">
                {currentStep === 'quantity' ? (
                  <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {/* Left Side - Card Preview */}
                  <div className="flex justify-center order-1 lg:order-1">
                    <div className="relative w-full max-w-[200px] sm:max-w-xs lg:max-w-sm">
                      {/* 2D Card Preview - Natural Position */}
                      <div 
                        className={`relative z-20 transition-opacity duration-600 ease-in-out ${
                          fadeTransition.isTransitioning && fadeTransition.show3D
                            ? 'opacity-0' 
                            : showCase3DPreview 
                              ? 'opacity-0' 
                              : 'opacity-100'
                        }`}
                      >
                        <LimitedEditionCardPreview />
                      </div>
                      
                      {/* 3D Card Preview - Absolute Overlay */}
                      <div 
                        className={`absolute inset-0 z-10 transition-opacity duration-600 ease-in-out ${
                          fadeTransition.isTransitioning && fadeTransition.show3D
                            ? 'opacity-100' 
                            : showCase3DPreview 
                              ? 'opacity-100' 
                              : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <CardPreviewWithCase
                          key={animationKey}
                          cardFrontImage="/Panther_v7_Pinkhair_FLAT.jpg"
                          cardBackImage="/card_back_cardifyCUnetnoise_scaleLevel3x2.0000001_211.jpg"
                          showCase={true}
                        />
                      </div>
                      
                      {/* Subtle glow effect behind card */}
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyber-cyan/10 via-cyber-pink/10 to-cyber-purple/10 blur-2xl scale-105 opacity-60" />
                      
                      {/* Sold out overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Shield className="w-12 h-12 text-red-400 mx-auto mb-2" />
                            <p className="text-red-400 font-bold text-lg">SOLD OUT</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Order Controls */}
                  <div className="flex justify-center lg:items-center order-2 lg:order-2">
                    <div className="w-full max-w-sm space-y-3 sm:space-y-4 lg:space-y-5">
                      {/* Quantity Selector - Improved mobile sizing */}
                      <div className={`space-y-2 ${isSoldOut ? 'opacity-50' : ''}`}>
                        <Label htmlFor="quantity" className="text-sm sm:text-base font-bold text-cyber-cyan tracking-wider">
                          Quantity
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            ref={firstFocusableRef}
                            variant="outline"
                            size="icon"
                            onClick={decrementQuantity}
                            onKeyDown={(e) => handleQuantityKeyDown(e, 'decrement')}
                            disabled={isDecrementDisabled || isSoldOut}
                            className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-8 lg:w-8 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan ${
                              (isDecrementDisabled || isSoldOut)
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan'
                            }`}
                            aria-label={`Decrease quantity${isDecrementDisabled ? ' (at minimum)' : ''}`}
                            title={isDecrementDisabled ? `Minimum quantity is ${QUANTITY_CONFIG.MIN}` : 'Decrease quantity'}
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3" />
                          </Button>
                          
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={maxQuantity}
                            value={quantityState.value}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            disabled={isSoldOut}
                            onKeyDown={(e) => {
                              // Prevent typing invalid characters
                              if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') {
                                e.preventDefault()
                              }
                              // Handle Enter key to validate current input
                              if (e.key === 'Enter') {
                                e.currentTarget.blur() // Remove focus to trigger validation
                              }
                            }}
                            onPaste={(e) => {
                              // Handle paste events - validate pasted content
                              e.preventDefault()
                              const pastedText = e.clipboardData.getData('text')
                              handleQuantityChange(pastedText)
                            }}
                            onFocus={(e) => {
                              // Select all text when input is focused for easy replacement
                              e.target.select()
                            }}
                            onBlur={(e) => {
                              // Ensure we have a valid value when input loses focus
                              if (e.target.value === '' || e.target.value === '0') {
                                handleQuantityChange(QUANTITY_CONFIG.DEFAULT.toString())
                              }
                            }}
                            className={`w-16 h-8 sm:w-20 sm:h-10 lg:w-16 lg:h-8 text-center bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan text-sm sm:text-base lg:text-sm font-bold ${
                              quantityState.error ? 'border-red-400 focus:border-red-400' : 'border-cyber-cyan/50 focus:border-cyber-cyan'
                            } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={`Quantity (current: ${quantityState.value}, max: ${maxQuantity})`}
                            aria-describedby={quantityState.error ? 'quantity-error' : undefined}
                            aria-invalid={!quantityState.isValid}
                          />
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={incrementQuantity}
                            onKeyDown={(e) => handleQuantityKeyDown(e, 'increment')}
                            disabled={isIncrementDisabled || isSoldOut}
                            className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-8 lg:w-8 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan ${
                              (isIncrementDisabled || isSoldOut)
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan'
                            }`}
                            aria-label={`Increase quantity${isIncrementDisabled ? ' (at maximum)' : ''}`}
                            title={isIncrementDisabled ? `Maximum quantity is ${maxQuantity}` : 'Increase quantity'}
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3" />
                          </Button>
                        </div>
                        {/* Enhanced error message display with accessibility */}
                        {quantityState.error && (
                          <p 
                            id="quantity-error"
                            className="text-xs text-red-400 font-medium bg-red-900/20 border border-red-400/30 rounded px-2 py-1"
                            role="alert"
                            aria-live="polite"
                          >
                            ⚠️ {quantityState.error}
                          </p>
                        )}
                        {!isSoldOut && inventoryState.data && (
                          <p className="text-xs text-gray-400">
                            Remaining: <span className="text-cyber-pink font-semibold">{inventoryState.data.inventory - quantityState.value}</span> cards
                          </p>
                        )}
                      </div>

                      {/* Display Case Option */}
                      <div className={`space-y-2 ${isSoldOut ? 'opacity-50' : ''}`}>
                        <div 
                          className="space-y-0.5"
                          onMouseEnter={handleShow3DPreview}
                          onMouseLeave={handleHide3DPreview}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="display-case-option"
                              checked={includeDisplayCase}
                              onChange={(e) => {
                                setIncludeDisplayCase(e.target.checked)
                                if (e.target.checked) {
                                  setDisplayCaseQuantity(Math.min(quantityState.value, displayCaseQuantity))
                                  // Show 3D case and activate mobile preview mode
                                  setShowCase3DPreview(true)
                                  setMobilePreviewActive(true)
                                } else {
                                  // Reset mobile preview when display case is unchecked
                                  if (mobilePreviewActive) {
                                    setMobilePreviewActive(false)
                                    setShowCase3DPreview(false)
                                    setFadeTransition({ isTransitioning: false, show3D: false })
                                  }
                                }
                              }}
                              disabled={isSoldOut}
                              className={`h-4 w-4 text-cyber-cyan focus:ring-cyber-cyan focus:ring-2 border-cyber-cyan/50 rounded bg-cyber-dark/80 checked:bg-cyber-cyan checked:border-cyber-cyan ${isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              aria-label="Add display case option"
                            />
                            <label htmlFor="display-case-option" className="text-base font-bold text-cyber-cyan tracking-wider cursor-pointer hover:text-cyber-pink">
                              Add acrylic display case(s)
                            </label>
                          </div>
                          <div className="ml-0 mt-5">
                            <span 
                              className="cursor-pointer flex items-center text-sm font-semibold gap-3 py-2"
                              onClick={isMobile ? handleMobilePreviewTap : undefined}
                            >
                              {isMobile ? (
                                <>
                                  {mobilePreviewActive ? (
                                    <EyeOff className="w-4 h-4 text-cyber-cyan" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-cyber-cyan" />
                                  )}
                                  <span className="bg-[linear-gradient(45deg,#00ffff_0%,#ff0080_25%,#00ff41_50%,#8a2be2_75%,#00ffff_100%)] bg-clip-text text-transparent bg-[length:400%_400%] bg-[position:0%_50%] sm:[animation:holographic-shift_3s_ease-in-out_infinite]">
                                    {mobilePreviewActive ? "Tap to hide display case" : "Tap to preview display case"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 text-cyber-cyan" />
                                  <span className="bg-[linear-gradient(45deg,#00ffff_0%,#ff0080_25%,#00ff41_50%,#8a2be2_75%,#00ffff_100%)] bg-clip-text text-transparent bg-[length:400%_400%] bg-[position:0%_50%] sm:[animation:holographic-shift_3s_ease-in-out_infinite]">
                                    Hover to preview display case
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {includeDisplayCase && (
                          <div className="pl-6 space-y-2">
                            <div className="flex items-center justify-between">
                              <label htmlFor="display-case-quantity" className="text-xs text-cyber-cyan/80">
                                Display Cases:
                              </label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDisplayCaseQuantity(Math.max(1, displayCaseQuantity - 1))}
                                  disabled={displayCaseQuantity <= 1 || isSoldOut}
                                  className="h-6 w-6 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan disabled:opacity-30"
                                  aria-label="Decrease display case quantity"
                                >
                                  <Minus className="w-2 h-2" />
                                </Button>
                                
                                <span className="px-2 py-1 text-cyber-cyan font-bold min-w-[2rem] text-center text-sm">
                                  {displayCaseQuantity}
                                </span>
                                
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDisplayCaseQuantity(Math.min(quantityState.value, displayCaseQuantity + 1))}
                                  disabled={displayCaseQuantity >= quantityState.value || isSoldOut}
                                  className="h-6 w-6 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan disabled:opacity-30"
                                  aria-label="Increase display case quantity"
                                >
                                  <Plus className="w-2 h-2" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-cyber-pink/80">
                              ${((inventoryState.data?.displayCases.pricePerUnit || 19.00) * displayCaseQuantity).toFixed(2)} ({displayCaseQuantity} × ${(inventoryState.data?.displayCases.pricePerUnit || 19.00).toFixed(2)} each)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price Display - Better mobile formatting with bulk discounts */}
                      <div className={`space-y-2 ${isSoldOut ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className="text-gray-300">Price per card:</span>
                          <div className="text-right">
                            <span className="text-cyber-green font-bold">${currentPricing.pricePerUnit.toFixed(2)}</span>
                            {currentPricing.discount > 0 && (
                              <div className="text-xs text-cyber-pink">
                                {currentPricing.discount}% off!
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {currentPricing.savings > 0 && (
                          <div className="flex justify-between items-center text-sm text-cyber-pink">
                            <span>Bulk discount:</span>
                            <span className="font-bold">-${currentPricing.savings.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-base sm:text-lg border-t border-cyber-cyan/20 pt-2">
                          <span className="text-white font-bold">Total:</span>
                          <span className="text-cyber-green font-bold text-lg sm:text-xl neon-green">${totalPrice}</span>
                        </div>
                      </div>

                      {/* Bulk Discount Tiers Display */}
                      {inventoryState.data && inventoryState.data.pricingTiers.length > 1 && !isSoldOut && (
                        <div className="text-xs text-gray-400 bg-cyber-dark/40 rounded-lg p-2 space-y-1">
                          <p className="font-semibold text-cyber-cyan">💰 Bulk Discounts:</p>
                          {inventoryState.data.pricingTiers.slice(1).map((tier, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{tier.quantity}+ cards:</span>
                              <span className="text-cyber-pink">{tier.discount}% off</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isSoldOut ? (
                        <Button
                          size="lg"
                          disabled
                          className="w-full px-4 py-3 sm:py-4 text-base font-bold tracking-wider bg-gray-600 hover:bg-gray-600 cursor-not-allowed opacity-50"
                        >
                          <Shield className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                          SOLD OUT
                          <Shield className="w-5 h-5 sm:w-4 sm:h-4 ml-2" />
                        </Button>
                      ) : showAddedToCart ? (
                        <div className="w-full px-4 py-3 sm:py-4 text-base font-bold tracking-wider bg-cyber-green/20 border-2 border-cyber-green text-cyber-green rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                          Added to Cart!
                          <Star className="w-5 h-5 sm:w-4 sm:h-4 ml-2 animate-pulse" />
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-3">
                          <Button
                            ref={lastFocusableRef}
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={isOrdering || !quantityState.isValid}
                            className="flex-1 lg:flex-[0.8] px-4 py-3 sm:py-4 text-base font-bold tracking-wider bg-cyber-dark/90 border-2 border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-dark hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:border-cyber-green transition-all duration-300 disabled:opacity-50 disabled:hover:bg-cyber-dark/90 disabled:hover:text-cyber-green disabled:hover:shadow-none"
                          >
                            <ShoppingBag className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                            Add to Cart
                          </Button>
                          
                          <Button
                            size="lg"
                            onClick={handleContinueToShipping}
                            disabled={isOrdering || !quantityState.isValid}
                            className="flex-1 lg:flex-[1.2] px-4 py-3 sm:py-4 text-lg font-bold tracking-wider cyber-button sm:animate-pulse disabled:opacity-50"
                          >
                            <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                            {isOrdering ? 'Processing...' : 'Buy Now'}
                            <Star className="w-5 h-5 sm:w-4 sm:h-4 ml-2 sm:animate-pulse" />
                          </Button>
                        </div>
                      )}

                      {/* Limited Edition Info */}
                      <div className="text-center space-y-1 p-2 sm:p-3 bg-cyber-dark/40 rounded-lg border border-cyber-pink/20">
                        <p className="text-cyber-pink font-semibold text-xs">
                          {isSoldOut ? '❌ Sold Out' : '🔥 Exclusive Limited Edition'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {isSoldOut 
                            ? 'This limited edition series has been completely sold out' 
                            : 'Premium quality • Holographic effects • Worldwide shipping'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>
                ) : (
                  /* Shipping Step */
                  <div className="max-w-md mx-auto py-6 sm:py-8">
                    <ShippingAddressForm
                      onSubmit={handleShippingSubmit}
                      onBack={handleBackToQuantity}
                      isSubmitting={isOrdering}
                    />
                  </div>
                )}
              </div>

              {/* Branding Section - Mobile-only reduced spacing */}
              <div className="text-center py-2 sm:py-3 px-4 border-t border-cyber-cyan/20 bg-cyber-dark/20">
                <div className="flex items-center justify-center">
                  <img 
                    src="/cardify-currentcolor_svg.svg" 
                    alt="Cardify" 
                    className="w-auto opacity-80 sm:animate-pulse sm:[animation:neonCycle_8s_ease-in-out_infinite]"
                    style={{ 
                      height: '1rem',
                      color: '#00ffff',
                      filter: 'drop-shadow(0 0 8px currentColor)'
                    }}
                  />
                  <style jsx>{`
                    @keyframes neonCycle {
                      0% { color: #00ffff; }
                      16.66% { color: #ff00ff; }
                      33.33% { color: #ffff00; }
                      50% { color: #00ff00; }
                      66.66% { color: #ff6600; }
                      83.33% { color: #6600ff; }
                      100% { color: #00ffff; }
                    }
                  `}</style>
                  {inventoryState.loading && (
                    <Loader2 className="w-3 h-3 text-cyber-cyan animate-spin ml-2" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 