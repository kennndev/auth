// app/api/webhooks/stripe-credits/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { getStripeServer } from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const stripe = getStripeServer("market")

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY")
  return createClient(url, key)
}

async function grantCredits(session: Stripe.Checkout.Session) {
  const a = admin()
  const md = (session.metadata ?? {}) as Record<string, string | undefined>
  if (md.kind !== "credits_purchase") return

  const userId = md.userId
  const credits = parseInt(md.credits ?? "0", 10)
  const amount_cents = session.amount_total ?? 0
  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent | undefined)?.id || session.id

  console.log("[credits] payload", { userId, credits, piId })
  if (!userId || !credits || credits <= 0 || !piId) return

  // 1) Idempotent ledger insert (ensure unique index on payment_intent)
  const { error: ledgerErr } = await a.from("credits_ledger").insert({
    user_id: userId,
    payment_intent: piId,
    amount_cents,
    credits,
    reason: "purchase",
  })
  if (ledgerErr && (ledgerErr as any).code !== "23505") {
    console.error("[credits] ledger insert error:", ledgerErr.message)
    return
  }
  if (!ledgerErr) console.log("[credits] ledger insert ok")

  // 2) ALWAYS increment mkt_profiles.credits (no RPC)
  const { data: prof, error: readErr } = await a
    .from("mkt_profiles")
    .select("credits")
    .eq("id", userId)
    .single()

  if (readErr && readErr.code !== "PGRST116") {
    console.error("[credits] profile read failed:", readErr.message)
    return
  }

  const current = Number(prof?.credits ?? 0)
  const next = current + credits

  const { error: upErr } = await a
    .from("mkt_profiles")
    .upsert({ id: userId, credits: next }, { onConflict: "id" })

  if (upErr) {
    console.error("[credits] profile upsert failed:", upErr.message)
    return
  }

  console.log("[credits] granted", { userId, credits, payment_intent: piId, newBalance: next })
}


export async function POST(req: NextRequest) {
  const raw = Buffer.from(await req.arrayBuffer())
  const sig = req.headers.get("stripe-signature") ?? ""

  // Dedicated secrets for this endpoint
  const primary = process.env.STRIPE_CREDITS_WEBHOOK_SECRET      // platform events
  const connect = process.env.STRIPE_CREDITS_CONNECT_SECRET      // connected events

  console.log("[credits] env", {
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasPrimary: !!primary,
    hasConnect: !!connect,
  })

  if (!primary && !connect) return new NextResponse("no secret", { status: 500 })

  let event: Stripe.Event | null = null
  try {
    if (!primary) throw new Error("skip primary")
    event = stripe.webhooks.constructEvent(raw, sig, primary)
  } catch (e1: any) {
    if (!connect) return new NextResponse("bad sig", { status: 400 })
    try {
      event = stripe.webhooks.constructEvent(raw, sig, connect)
    } catch (e2: any) {
      return new NextResponse("bad sig", { status: 400 })
    }
  }

  const ack = NextResponse.json({ received: true })

  queueMicrotask(async () => {
    try {
      if (event?.type === "checkout.session.completed") {
        await grantCredits(event.data.object as Stripe.Checkout.Session)
      }
    } catch (err) {
      console.error("[credits] handler error:", err)
    }
  })

  return ack
}
