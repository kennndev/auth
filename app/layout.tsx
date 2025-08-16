import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"
import { PrivyProviders } from "./Privy-provider"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cardify - AI-Powered Trading Cards",
  description: "Easily design and order AI-powered custom trading cards. Digital NFTs or printed cards — fast, collectible, and creator-friendly.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
                   <PrivyProviders
          config={{
            loginMethods: ['wallet'],
            embeddedWallets: { createOnLogin: 'users-without-wallets' },
          }}
        >
        <CartProvider>
                <Navigation />
          {children}
        </CartProvider>
        </PrivyProviders>
      </body>
    </html>
  )
}
