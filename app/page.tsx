"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Shield, ArrowRight, Globe, Brain, Printer, Upload } from "lucide-react"
import Link from "next/link"
import { LimitedEditionModalWithSuspense } from "@/components/LazyComponents"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [hasModalBeenClosed, setHasModalBeenClosed] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Wait for modal fade-out animation to complete before showing content
    setTimeout(() => {
      setHasModalBeenClosed(true)
      // Small additional delay to ensure smooth transition
      setTimeout(() => {
        setShowContent(true)
      }, 50)
    }, 250) // Slightly less than modal's 300ms animation
  }
  
  const handleOpenModal = () => {
    setIsModalOpen(true)
    setHasModalBeenClosed(false)
    setShowContent(false)
  }

  useEffect(() => {
    // Check URL params on mount
    const params = new URLSearchParams(window.location.search)
    if (params.get('openLimitedEdition') === 'true') {
      handleOpenModal()
      // Clean up URL without reload
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    // Listen for custom event from cart
    const handleCustomEvent = () => {
      handleOpenModal()
    }
    
    window.addEventListener('openLimitedEditionModal', handleCustomEvent)
    
    return () => {
      window.removeEventListener('openLimitedEditionModal', handleCustomEvent)
    }
  }, [])

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">

      {/* Limited Edition Modal - Always rendered first */}
      <LimitedEditionModalWithSuspense isOpen={isModalOpen} onClose={handleModalClose} />

      {/* Only render heavy content after modal has been closed */}
      {hasModalBeenClosed && (
        <div className={`transition-opacity duration-700 ease-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          {/* Animated Grid Background - Fade in first */}
          <div className="absolute inset-0 cyber-grid opacity-20" />

          {/* Scanlines Effect - Fade in last */}
          <div className="absolute inset-0 scanlines opacity-30" />

          {/* Hero Section */}
          <section className="relative px-6 py-20 pt-24 md:pt-40 overflow-hidden fade-in">
            {/* Enhanced Glowing orbs with staggered animations - Reduced for performance */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-cyber-cyan rounded-full blur-3xl animate-glow-cyan" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-40 right-20 w-48 h-48 bg-cyber-pink rounded-full blur-3xl animate-glow-pink" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyber-purple rounded-full blur-3xl animate-glow-purple" style={{ animationDelay: '0.7s' }} />
            <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-cyber-green rounded-full blur-3xl animate-glow-green" style={{ animationDelay: '0.9s' }} />

        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-wider">
            <span className="text-white">Create Epic</span>
            <br />
            <span className="holographic glitch" data-text="Trading Cards">
              Trading Cards
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your artwork into beautiful <span className="neon-green">physical trading cards</span>. Upload your designs and get them professionally
            printed with premium quality and worldwide shipping.
          </p>

          <div className="flex flex-col gap-6 justify-center items-center">
            <Link href="/upload">
              <Button size="lg" className="cyber-button px-10 py-6 text-lg font-bold tracking-wider">
                <Upload className="w-5 h-5 mr-3" />
                Upload Design
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-20 relative fade-in">
            <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-wider">
              <span className="neon-cyan">Powerful</span> Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to transform your designs into professional trading cards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-cyan/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-cyan/30 transition-colors">
                  <Upload className="w-8 h-8 text-cyber-cyan" />
                </div>
                <h3 className="text-xl font-bold text-cyber-cyan mb-4 tracking-wider">Easy Upload Process</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Simply upload your artwork and we&apos;ll handle the rest. Automatic cropping to perfect card dimensions, 
                  instant preview, and support for all major image formats.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-pink/30 hover:border-cyber-pink hover:shadow-lg hover:shadow-cyber-pink/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-pink/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-pink/30 transition-colors">
                  <Printer className="w-8 h-8 text-cyber-pink" />
                </div>
                <h3 className="text-xl font-bold text-cyber-pink mb-4 tracking-wider">Premium Printing & Foils</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Premium card stock with multiple foil options including holographic, rainbow, and metallic finishes. 
                  Professional quality that rivals major trading card companies.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-purple/30 hover:border-cyber-purple hover:shadow-lg hover:shadow-cyber-purple/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-purple/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-purple/30 transition-colors">
                  <Brain className="w-8 h-8 text-cyber-purple" />
                </div>
                <h3 className="text-xl font-bold text-cyber-purple mb-4 tracking-wider">AI Prompt Builder</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Create perfect prompts for AI art tools with our interactive builder. Tested templates
                  and examples help you generate stunning card designs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-green/30 hover:border-cyber-green hover:shadow-lg hover:shadow-cyber-green/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-green/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-green/30 transition-colors">
                  <Shield className="w-8 h-8 text-cyber-green" />
                </div>
                <h3 className="text-xl font-bold text-cyber-green mb-4 tracking-wider">Display Cases</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Protect your cards with premium acrylic display cases. Perfect for showcasing your collection
                  or gifting to fellow collectors.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-blue/30 hover:border-cyber-blue hover:shadow-lg hover:shadow-cyber-blue/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-blue/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-blue/30 transition-colors">
                  <Globe className="w-8 h-8 text-cyber-blue" />
                </div>
                <h3 className="text-xl font-bold text-cyber-blue mb-4 tracking-wider">Global Shipping</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  We ship worldwide to any country supported by our payment system. Track your order
                  from printing to delivery with real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-orange/30 hover:border-cyber-orange hover:shadow-lg hover:shadow-cyber-orange/20 transition-all duration-500 group hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-orange/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-orange/30 transition-colors">
                  <Sparkles className="w-8 h-8 text-cyber-orange" />
                </div>
                <h3 className="text-xl font-bold text-cyber-orange mb-4 tracking-wider">Bulk Discounts</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Save more when you order more. Tiered pricing for bulk orders perfect for creators,
                  artists, and businesses looking to print card collections.
                </p>
              </CardContent>
            </Card>
          </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-6 py-20 relative fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 via-cyber-pink/5 to-cyber-purple/5" />
            <div className="max-w-4xl mx-auto text-center relative">
          <Card className="bg-cyber-dark/80 backdrop-blur-sm border border-cyber-cyan/50 neon-glow-cyan">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-wider">
                <span className="holographic">Ready to Create?</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 mb-8">
                Start designing your first trading card today.{" "}
                <span className="neon-green">No experience required.</span>
              </p>
              <div className="flex flex-col gap-4 justify-center max-w-2xl mx-auto">
                <Link href="/upload" className="w-full">
                  <Button
                    size="lg"
                    className="cyber-button w-full px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold tracking-wider"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
            </Card>
          </div>
          </section>

          {/* Footer */}
          <footer className="px-6 py-8 border-t border-cyber-cyan/20 bg-cyber-dark/40">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Cardify. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
