// lib/stripe-server.ts
import Stripe from "stripe"

export type StripeTenant = "platform" | "market"

// Cache per-tenant Stripe instances (singleton)
const cache: Partial<Record<StripeTenant, Stripe>> = {}

function reqEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

/**
 * Get a server-side Stripe SDK instance for a given tenant.
 * - "platform" → uses PLATFORM_STRIPE_SECRET_KEY
 * - "market"   → uses MARKET_STRIPE_SECRET_KEY
 */
export function getStripeServer(tenant: StripeTenant): Stripe {
  if (cache[tenant]) return cache[tenant]!

  if (tenant === "platform") {
    cache.platform = new Stripe(reqEnv("PLATFORM_STRIPE_SECRET_KEY"), {
      // apiVersion: "2023-10-16", // pin if you want
      typescript: true,
    })
    return cache.platform
  }

  cache.market = new Stripe(reqEnv("MARKET_STRIPE_SECRET_KEY"), {
    // apiVersion: "2023-10-16",
    typescript: true,
  })
  return cache.market
}

/** Optional helper: normalize arbitrary input to a tenant */
export function resolveTenant(value?: string | null): StripeTenant {
  return value === "market" ? "market" : "platform"
}

/** Validate a given tenant’s connection (handy for health checks) */
export async function validateStripeConnection(tenant: StripeTenant): Promise<boolean> {
  try {
    const stripe = getStripeServer(tenant)
    const acct = await stripe.accounts.retrieve()
    console.log(`✅ ${tenant} Stripe OK:`, acct.id)
    return true
  } catch (err) {
    console.error(`❌ ${tenant} Stripe FAIL:`, err)
    return false
  }
}
