// app/api/credits/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getStripeServer } from "@/lib/stripe"

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
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { usd } = await req.json().catch(() => ({}))
    if (!ALLOWED_PACKS.includes(usd)) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
    }

    const credits = usd * CREDITS_PER_USD

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: siteUrl("/credits?success=1"),
      cancel_url: siteUrl("/credits?canceled=1"),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: usd * 100,
            product_data: {
              name: `${credits} Image Credits`,
              description: `$${usd} credit pack (${credits} images)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "credits_purchase",
        userId: user.id,
        credits: String(credits),
        usd: String(usd),
      },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Checkout error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
