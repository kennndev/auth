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

  // 1) Try to write the ledger. If it's a duplicate (23505), we STOP here.
  const { data: ledgerData, error: ledgerErr } = await a
    .from("credits_ledger")
    .insert({
      user_id: userId,
      payment_intent: piId,
      amount_cents,
      credits,
      reason: "purchase",
    })
    .select("payment_intent") // returns row only on success

  if (ledgerErr) {
    if ((ledgerErr as any).code === "23505") {
      // Duplicate PI → credits already granted earlier; do nothing.
      console.log("[credits] duplicate payment_intent; skipping increment", { piId })
      return
    }
    console.error("[credits] ledger insert error:", ledgerErr)
    return
  }

  if (!ledgerData || ledgerData.length === 0) {
    // Safety: if nothing returned, don't risk double increment.
    console.warn("[credits] ledger insert returned no rows; skipping increment")
    return
  }

  console.log("[credits] ledger insert ok", { piId })

  // 2) Increment mkt_profiles.credits (no RPC). Only runs when ledger insert succeeded.
  const { data: prof, error: readErr } = await a
    .from("mkt_profiles")
    .select("credits")
    .eq("id", userId)
    .single()

  // PGRST116 = row not found (first-time user is fine)
  if (readErr && (readErr as any).code !== "PGRST116") {
    console.error("[credits] profile read failed:", readErr)
    return
  }

  const current = Number(prof?.credits ?? 0)
  const next = current + credits

  const { error: upErr } = await a
    .from("mkt_profiles")
    .upsert({ id: userId, credits: next }, { onConflict: "id" })

  if (upErr) {
    console.error("[credits] profile upsert failed:", upErr)
    return
  }

  console.log("[credits] granted", { userId, credits, payment_intent: piId, newBalance: next })
}

export async function POST(req: NextRequest) {
  const raw = Buffer.from(await req.arrayBuffer())
  const sig = req.headers.get("stripe-signature") ?? ""

  const primary = process.env.STRIPE_CREDITS_WEBHOOK_SECRET
  const connect = process.env.STRIPE_CREDITS_WEBHOOK_SECRET

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

  // Do the work synchronously, then ACK (Stripe allows ~10s).
  if (event?.type === "checkout.session.completed") {
    await grantCredits(event.data.object as Stripe.Checkout.Session)
  }

  return NextResponse.json({ received: true })
}
