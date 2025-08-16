// app/api/credits/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getStripeServer } from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Use your PLATFORM stripe client (do NOT pass a connected account header here)
const stripe = getStripeServer("market")

const CREDITS_PER_USD = 4
const ALLOWED_PACKS = [20, 40, 60] as const

function siteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://auth-coral-eight-31.vercel.app"
  return `${base}${path}`
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { usd } = await req.json().catch(() => ({}))
  if (!ALLOWED_PACKS.includes(usd)) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
  }

  const credits = usd * CREDITS_PER_USD
  const amountCents = usd * 100
  const md = {
    kind: "credits_purchase",
    userId: user.id,
    credits: String(credits),
    usd: String(usd),
  }

  // Create a PLATFORM Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: siteUrl("/credits?success=1"),
    cancel_url: siteUrl("/credits?canceled=1"),

    // Helps you correlate in logs / analytics
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,

    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${credits} Image Credits`,
            description: `$${usd} credit pack (${credits} images)`,
          },
        },
        quantity: 1,
      },
    ],

    // Write metadata to the Session (consumed by the credits webhook)
    metadata: md,

    // Also copy the same metadata to the PaymentIntent (useful for backups / audits)
    payment_intent_data: {
      metadata: md,
    },
  })

  return NextResponse.json({ url: session.url }, { status: 200 })
}
