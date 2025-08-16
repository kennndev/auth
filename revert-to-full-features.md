# Revert to Full Features Guide

This document contains the original code that was removed to create the upload-only version of the landing page. Follow these instructions to restore the full functionality.

## 1. Restore Hero Section Buttons in `app/page.tsx`

### Location: Lines 51-59
Replace the single upload button with the original two-button layout:

```tsx
          <div className="flex flex-col gap-6 justify-center items-center">
            <Link href="/quick-card">
              <Button size="lg" className="cyber-button px-10 py-6 text-lg font-bold tracking-wider">
                <Brain className="w-5 h-5 mr-3" />
                Create Card
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>

            <div className="flex flex-col items-center gap-3">
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-cyber-dark/80 border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20 px-10 py-6 text-lg font-bold tracking-wider transition-all duration-300"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  Upload Design
                </Button>
              </Link>
              <p className="text-sm text-gray-400 tracking-wide">Already have a card design?</p>
            </div>
          </div>
```

## 2. Restore AI-Powered Generation Feature Card

### Location: Before the Custom Printing card (around line 76)
Add back the AI feature card:

```tsx
            <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20 transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyber-cyan/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyber-cyan/30 transition-colors">
                  <Brain className="w-8 h-8 text-cyber-cyan" />
                </div>
                <h3 className="text-xl font-bold text-cyber-cyan mb-4 tracking-wider">AI-Powered Generation</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Generate stunning artwork and custom frames using our specialized AI engine optimized for trading card artwork. Create unique, photorealistic designs with
                  simple text prompts and watch your vision come to life.
                </p>
              </CardContent>
            </Card>
```

## 3. Restore CTA Section Buttons

### Location: Lines 154-165
Replace the single upload button with both buttons:

```tsx
              <div className="flex flex-col gap-4 justify-center max-w-2xl mx-auto">
                <Link href="/quick-card" className="w-full">
                  <Button
                    size="lg"
                    className="cyber-button w-full px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold tracking-wider"
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                    Get Started Now
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3" />
                  </Button>
                </Link>
                <Link href="/upload" className="w-full">
                  <Button
                    size="lg"
                    className="bg-cyber-dark/80 border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20 w-full px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold tracking-wider transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                    Upload Your Art
                  </Button>
                </Link>
              </div>
```

## 4. Restore Navigation Component (`components/navigation.tsx`)

### Add imports back:
```tsx
import { Button } from "@/components/ui/button"
import { Menu, X, User, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { AuthModal } from "@/components/auth-modal"
```

### Add state for auth modal:
```tsx
export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const isVisible = useNavigationVisibility()
```

### Restore desktop navigation buttons:
```tsx
          {/* Desktop Navigation - moved to the right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/quick-card">
              <Button className="bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10 hover:shadow-lg hover:shadow-cyber-green/20 tracking-wider">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Card
              </Button>
            </Link>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20 tracking-wider"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
```

### Restore mobile navigation buttons:
```tsx
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-cyber-black/95 backdrop-blur-md border-b border-cyber-cyan/30 md:hidden">
            <div className="px-6 py-4 space-y-4">
              <Link href="/quick-card" className="block">
                <Button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10 tracking-wider"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Card
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setIsAuthModalOpen(true)
                  setIsMenuOpen(false)
                }}
                className="w-full bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 tracking-wider"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        )}
```

### Add AuthModal component back at the end:
```tsx
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
```

## Summary

These changes will restore:
1. The "Create Card" primary CTA button
2. The AI-Powered Generation feature card
3. Both buttons in the CTA section
4. Sign In and Create Card buttons in the navigation
5. The AuthModal functionality