"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShippingAddressForm, type ShippingAddress } from "./shipping-address-form"
import { ArrowLeft } from "lucide-react"
import { csrfFetch } from "@/lib/csrf-client"

import type { CartItem } from "@/lib/cart-context"

interface CartCheckoutModalProps {
  cartItems: CartItem[]
  subtotal: number
  onBack: () => void
  onSuccess: () => void
}

export function CartCheckoutModal({ cartItems, subtotal, onBack, onSuccess }: CartCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleSubmit = async (address: ShippingAddress) => {
    setIsProcessing(true)
    
    try {
      // Build line items from cart
      const lineItems = cartItems.flatMap((item) => {
        const cardItem = {
          productId: item.type === 'limited-edition' ? 'limited-edition-card' : 'custom-card',
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          name: item.name,
          image: item.image,
          ...(item.type === 'custom-card' && {
            cardFinish: item.cardFinish,
            customImageUrl: item.image,
            uploadId: item.uploadId
          })
        }
        
        const items = [cardItem]
        
        if (item.includeDisplayCase && item.displayCaseQuantity > 0) {
          items.push({
            productId: 'display-case',
            quantity: item.displayCaseQuantity,
            pricePerUnit: item.displayCasePricePerUnit || 19.00,
            name: 'Acrylic Display Case',
            image: '/display-case.jpg'
          })
        }
        
        return items
      })

      const response = await csrfFetch('/api/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ 
          cartItems: lineItems,
          isCartCheckout: true,
          shippingAddress: address
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      
      // Call success callback to clear cart
      onSuccess()
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-cyber-cyan/20">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="text-cyber-cyan hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-white">Shipping Information</h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="bg-cyber-dark/60 border-cyber-cyan/30 p-4 mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-400">Items:</span>
            <span className="text-white">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Subtotal:</span>
            <span className="text-cyber-green font-bold text-lg">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Shipping and taxes calculated at checkout
          </p>
        </Card>
        
        <ShippingAddressForm
          onSubmit={handleSubmit}
          onBack={onBack}
          isSubmitting={isProcessing}
        />
      </div>
    </div>
  )
}