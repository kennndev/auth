"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Minus, Plus, ShoppingCart, Trash2, AlertCircle } from "lucide-react"
import { useCart, type CartItem } from "@/lib/cart-context"
import { CartCheckoutModal } from "./cart-checkout-modal"
import Image from "next/image"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateItem, removeItem, clearCart, getSubtotal } = useCart()
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  
  const subtotal = getSubtotal()

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
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isVisible])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItem(id, { quantity: newQuantity })
  }

  const handleDisplayCaseQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return
    updateItem(id, { displayCaseQuantity: newQuantity })
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    setShowCheckout(true)
  }
  
  const handleCheckoutSuccess = () => {
    clearCart()
    setShowCheckout(false)
    onClose()
  }
  
  const handleBackFromCheckout = () => {
    setShowCheckout(false)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[200] font-mono transition-all duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-cyber-dark/95 backdrop-blur-md border-l-2 border-cyber-cyan/30 shadow-2xl shadow-cyber-cyan/20 transition-transform duration-300 ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
      }`}>
        {showCheckout ? (
          <CartCheckoutModal
            cartItems={items}
            subtotal={subtotal}
            onBack={handleBackFromCheckout}
            onSuccess={handleCheckoutSuccess}
          />
        ) : (
          <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyber-cyan/20">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyber-cyan" />
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md border border-cyber-cyan/50 bg-cyber-dark/80 backdrop-blur-sm 
                         text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-lg hover:shadow-cyber-cyan/20
                         transition-all duration-200 group"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Your cart is empty</p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      onClose()
                      window.location.href = '/upload'
                    }}
                    className="cyber-button font-bold tracking-wider"
                  >
                    Create Custom Card
                  </Button>
                  <Button
                    onClick={() => {
                      onClose()
                      // If already on homepage, just open the modal
                      if (window.location.pathname === '/') {
                        // Dispatch custom event to open limited edition modal
                        window.dispatchEvent(new CustomEvent('openLimitedEditionModal'))
                      } else {
                        // Navigate to homepage with query param to open modal
                        window.location.href = '/?openLimitedEdition=true'
                      }
                    }}
                    className="bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20 tracking-wider font-bold"
                  >
                    View Limited Edition
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-cyber-dark/60 border-cyber-cyan/30 p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="relative w-20 h-28 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm mb-1">{item.name}</h3>
                        <p className="text-cyber-purple text-xs mb-2">
                          {item.type === 'custom-card' && `${item.cardFinish} finish`}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="h-6 w-6 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="h-6 w-6 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-cyber-green text-sm ml-2">
                            ${(item.pricePerUnit * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Display Case Option */}
                        {item.includeDisplayCase && (
                          <div className="border-t border-cyber-cyan/20 pt-2 mt-2">
                            <p className="text-xs text-cyber-cyan mb-1">Display Cases:</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDisplayCaseQuantityChange(item.id, item.displayCaseQuantity - 1)}
                                className="h-5 w-5 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan"
                              >
                                <Minus className="w-2 h-2" />
                              </Button>
                              <span className="text-white text-xs w-6 text-center">{item.displayCaseQuantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDisplayCaseQuantityChange(item.id, item.displayCaseQuantity + 1)}
                                disabled={item.displayCaseQuantity >= item.quantity}
                                className="h-5 w-5 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-2 h-2" />
                              </Button>
                              <span className="text-cyber-purple text-xs ml-2">
                                ${((item.displayCasePricePerUnit || 19) * item.displayCaseQuantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:bg-red-400/10 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {/* Combined Shipping Notice */}
                <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-cyber-cyan">
                      All items will be shipped together for combined shipping. 
                      International shipping calculated at checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-cyber-cyan/20 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Subtotal:</span>
                <span className="text-cyber-green font-bold text-xl neon-green">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full cyber-button font-bold tracking-wider"
              >
                Proceed to Checkout
              </Button>
              
              <Button
                onClick={clearCart}
                variant="ghost"
                className="w-full text-gray-400 hover:text-red-400 hover:bg-transparent"
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}