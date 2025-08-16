"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home, Mail, Crown, Sparkles, ArrowRight, RefreshCw, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { XLogo } from "@/components/ui/x-logo"

interface SessionData {
  customer_email: string
  amount_total: number
  quantity: number
  marketing_consent: boolean
}

interface ErrorState {
  type: 'network' | 'timeout' | 'not_found' | 'invalid_session' | 'server' | 'unknown'
  message: string
  canRetry: boolean
  details?: string
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Network status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Enhanced error classification
  const classifyError = useCallback((error: any, response?: Response): ErrorState => {
    // Network errors
    if (!navigator.onLine) {
      return {
        type: 'network',
        message: 'No internet connection',
        canRetry: true,
        details: 'Please check your internet connection and try again.'
      }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed',
        canRetry: true,
        details: 'Unable to connect to the server. Please check your connection.'
      }
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timed out',
        canRetry: true,
        details: 'The server is taking too long to respond. Please try again.'
      }
    }

    // HTTP status-based errors
    if (response) {
      switch (response.status) {
        case 404:
          return {
            type: 'not_found',
            message: 'Order not found',
            canRetry: false,
            details: 'This order session could not be found. It may have expired or is invalid.'
          }
        case 400:
          return {
            type: 'invalid_session',
            message: 'Invalid session',
            canRetry: false,
            details: 'The provided session ID is not valid. Please check your order confirmation email.'
          }
        case 500:
        case 502:
        case 503:
          return {
            type: 'server',
            message: 'Server error',
            canRetry: true,
            details: 'Our servers are experiencing issues. Please try again in a few moments.'
          }
        default:
          return {
            type: 'unknown',
            message: 'Unexpected error',
            canRetry: true,
            details: `Server responded with status ${response.status}. Please try again.`
          }
      }
    }

    // Generic error fallback
    return {
      type: 'unknown',
      message: 'Something went wrong',
      canRetry: true,
      details: error.message || 'An unexpected error occurred. Please try again.'
    }
  }, [])

  // Enhanced data fetching with timeout and retry logic
  const fetchSessionData = useCallback(async (isRetry = false) => {
    if (!sessionId) {
      setError({
        type: 'invalid_session',
        message: 'No session ID provided',
        canRetry: false,
        details: 'Please access this page from your order confirmation email or checkout process.'
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setLoadingProgress(0)

      // Simulate loading progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Create abort controller for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(`/api/checkout-sessions/${sessionId}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setLoadingProgress(100)

      if (!response.ok) {
        const errorState = classifyError(new Error(`HTTP ${response.status}`), response)
        throw { ...errorState, response }
      }

      const data = await response.json()
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }

      setSessionData(data)
      setRetryCount(0) // Reset retry count on success
      
      // Complete loading animation
      setTimeout(() => setLoading(false), 300)
      
    } catch (error: any) {
      console.error('Error fetching session data:', error)
      
      const errorState = error.response ? 
        classifyError(error, error.response) : 
        classifyError(error)
      
      setError(errorState)
      setLoading(false)
      setLoadingProgress(0)
    }
  }, [sessionId, classifyError])

  // Retry function
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    fetchSessionData(true)
  }, [fetchSessionData])

  // Initial data fetch
  useEffect(() => {
    fetchSessionData()
  }, [fetchSessionData])

  // Auto-retry on network reconnection
  useEffect(() => {
    if (isOnline && error?.type === 'network' && retryCount < 3) {
      const timer = setTimeout(() => {
        handleRetry()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, error, retryCount, handleRetry])

  const handleXShare = () => {
    const text = 'Just ordered my custom trading cards from Cardify! 🔥✨ #CardifyClub #CustomCards #TradingCards'
    const url = 'https://cardify.club'
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        {/* Scanlines Effect */}
        <div className="absolute inset-0 scanlines opacity-30" />
        
        {/* Network status indicator */}
        <div className="absolute top-6 right-6">
          {isOnline ? (
            <div className="flex items-center gap-2 text-cyber-green text-sm">
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-cyber-red text-sm">
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </div>
          )}
        </div>
        
        <Card className="bg-cyber-dark/80 backdrop-blur-sm border border-cyber-cyan/50 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-cyber-cyan/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-cyber-cyan animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-cyber-cyan mb-4 tracking-wider">Loading Order Details...</h2>
            <p className="text-gray-300 mb-4">Please wait while we retrieve your order information.</p>
            
            {/* Enhanced loading progress */}
            <div className="w-full bg-cyber-dark/50 rounded-full h-2 mb-4">
              <div 
                className="bg-cyber-cyan h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            
            {retryCount > 0 && (
              <p className="text-cyber-orange text-sm">
                Retry attempt {retryCount}/3...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    const getErrorIcon = () => {
      switch (error.type) {
        case 'network':
          return <WifiOff className="w-8 h-8 text-cyber-red" />
        case 'timeout':
          return <AlertTriangle className="w-8 h-8 text-cyber-orange" />
        case 'not_found':
        case 'invalid_session':
          return <Mail className="w-8 h-8 text-cyber-red" />
        default:
          return <AlertTriangle className="w-8 h-8 text-cyber-red" />
      }
    }

    const getErrorColor = () => {
      switch (error.type) {
        case 'timeout':
          return 'cyber-orange'
        case 'network':
          return 'cyber-red'
        default:
          return 'cyber-red'
      }
    }

    return (
      <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        {/* Scanlines Effect */}
        <div className="absolute inset-0 scanlines opacity-30" />
        
        {/* Network status indicator */}
        <div className="absolute top-6 right-6">
          {isOnline ? (
            <div className="flex items-center gap-2 text-cyber-green text-sm">
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-cyber-red text-sm">
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </div>
          )}
        </div>
        
        <Card className={`bg-cyber-dark/80 backdrop-blur-sm border border-${getErrorColor()}/50 max-w-md w-full mx-4`}>
          <CardContent className="p-8 text-center">
            <div className={`w-16 h-16 bg-${getErrorColor()}/20 rounded-full flex items-center justify-center mb-6 mx-auto`}>
              {getErrorIcon()}
            </div>
            <h2 className={`text-xl font-bold text-${getErrorColor()} mb-4 tracking-wider`}>
              {error.message}
            </h2>
            <p className="text-gray-300 mb-6">{error.details}</p>
            
            {/* Action buttons */}
            <div className="space-y-3">
              {error.canRetry && (
                <Button 
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                  className={`w-full bg-cyber-dark/80 border-2 border-${getErrorColor()} text-${getErrorColor()} hover:bg-${getErrorColor()}/10 hover:shadow-lg hover:shadow-${getErrorColor()}/20 font-bold tracking-wider transition-all duration-300`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? 'Max Retries Reached' : `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </Button>
              )}
              
              <Link href="/" className="block w-full">
                <Button className="w-full cyber-button tracking-wider">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
              
              {error.type === 'invalid_session' && (
                <div className="mt-4 p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
                  <p className="text-cyber-cyan text-sm">
                    💡 Tip: Check your order confirmation email for the correct link
                  </p>
                </div>
              )}
              
              {error.type === 'network' && !isOnline && (
                <div className="mt-4 p-3 bg-cyber-orange/10 border border-cyber-orange/30 rounded">
                  <p className="text-cyber-orange text-sm">
                    📶 We'll automatically retry when your connection is restored
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Scanlines Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />

      {/* Glowing orbs background */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-cyber-green rounded-full blur-3xl opacity-10 animate-glow-green" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-cyber-pink rounded-full blur-3xl opacity-8 animate-glow-pink" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyber-cyan rounded-full blur-3xl opacity-6 animate-glow-cyan" />

      <div className="relative flex flex-col min-h-screen">
        <div className="flex-1 px-6 py-20 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-cyber-green/20 rounded-full flex items-center justify-center mb-6 mx-auto neon-glow-green">
                <CheckCircle className="w-12 h-12 text-cyber-green" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-wider">
                <span className="holographic glitch" data-text="Order Complete!">
                  Order Complete!
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Your custom cards are on their way! 🎉
              </p>
              <p className="text-sm text-cyber-green tracking-wider">
                <Crown className="w-4 h-4 inline mr-1" />
                EXCLUSIVE CARDIFY CUSTOM SERIES
              </p>
            </div>

            {/* Order Details Card */}
            {sessionData && (
              <Card className="bg-cyber-dark/80 backdrop-blur-sm border border-cyber-cyan/50 neon-glow-cyan mb-6">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-cyber-cyan mb-6 tracking-wider flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-cyber-cyan/20 gap-2">
                      <span className="text-gray-300">Email Confirmation:</span>
                      <span className="text-cyber-green font-mono break-all text-sm sm:text-base">{sessionData.customer_email}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-cyber-cyan/20">
                      <span className="text-gray-300">Quantity:</span>
                      <span className="text-white font-bold">{sessionData.quantity} card{sessionData.quantity > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-cyber-cyan/20">
                      <span className="text-gray-300">Total Paid:</span>
                      <span className="text-cyber-pink font-bold text-xl">
                        ${(sessionData.amount_total / 100).toFixed(2)}
                      </span>
                    </div>
                    
                    {sessionData.marketing_consent && (
                      <div className="bg-cyber-green/10 border border-cyber-green/30 rounded-lg p-4 mt-4">
                        <p className="text-cyber-green text-sm flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          You're subscribed to our newsletter for exclusive updates!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Card */}
            <Card className="bg-cyber-dark/80 backdrop-blur-sm border border-cyber-pink/50 neon-glow-pink mb-6">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-cyber-pink mb-6 tracking-wider">
                  Join the Community
                </h2>
                
                <p className="text-gray-300 mb-6">
                  Connect with fellow collectors and share your custom cards!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleXShare}
                    className="bg-cyber-dark/80 border-2 border-white text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 font-bold tracking-wider px-6 py-3 transition-all duration-300"
                  >
                    Share on <XLogo className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Link href="https://discord.gg/UyCMKFHB" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto bg-cyber-dark/80 border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10 hover:shadow-lg hover:shadow-[#5865F2]/20 font-bold tracking-wider px-6 py-3 transition-all duration-300">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Join Discord
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="bg-cyber-dark/80 backdrop-blur-sm border border-cyber-orange/50 neon-glow-orange mb-6">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-cyber-orange mb-6 tracking-wider">What's Next?</h2>
                
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyber-orange/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-cyber-orange text-xs font-bold">1</span>
                    </div>
                    <p>You'll receive an email confirmation with tracking details within 24 hours.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyber-orange/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-cyber-orange text-xs font-bold">2</span>
                    </div>
                    <p>Your cards will be professionally printed and shipped within 3-5 business days.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyber-orange/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-cyber-orange text-xs font-bold">3</span>
                    </div>
                    <p>Follow us on social media for updates on new releases!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Home Button */}
            <div className="text-center">
              <Link href="/">
                <Button className="cyber-button font-bold tracking-wider text-lg px-8 py-3">
                  <Home className="w-5 h-5 mr-2" />
                  Return to Home
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer - Now properly at bottom */}
        <footer className="px-6 py-8 border-t border-cyber-cyan/20 bg-cyber-dark/40">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Cardify. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Scanlines Effect */}
      <div className="absolute inset-0 scanlines opacity-30" />

      <div className="relative px-6 py-20 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-cyber-cyan/20 rounded-full flex items-center justify-center mb-6 mx-auto neon-glow-cyan animate-pulse">
              <RefreshCw className="w-12 h-12 text-cyber-cyan animate-spin" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-wider">
              <span className="holographic glitch" data-text="Loading...">
                Loading...
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Preparing your order details...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  )
}