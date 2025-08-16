// lib/stripe-client.ts
import { loadStripe, Stripe } from "@stripe/stripe-js"

export type StripeTenant = "platform" | "market"

const PUBLISHABLE_KEYS: Record<StripeTenant, string> = {
  platform: process.env.NEXT_PUBLIC_PLATFORM_STRIPE_PK || "",
  market:   process.env.NEXT_PUBLIC_MARKET_STRIPE_PK   || "",
}

function reqPk(tenant: StripeTenant) {
  const key = PUBLISHABLE_KEYS[tenant]
  if (!key) throw new Error(`Missing publishable key for ${tenant}. Add NEXT_PUBLIC_${tenant.toUpperCase()}_STRIPE_PK to .env`)
  return key
}

// One lazy-loaded promise per tenant
const cache: Partial<Record<StripeTenant, Promise<Stripe | null>>> = {}

export function getStripeClient(tenant: StripeTenant = "platform"): Promise<Stripe | null> {
  if (!cache[tenant]) {
    cache[tenant] = loadStripe(reqPk(tenant))
  }
  return cache[tenant]!
}

// Optional helper if you pass strings around
export function resolveTenant(value?: string | null): StripeTenant {
  return value === "market" ? "market" : "platform"
}
