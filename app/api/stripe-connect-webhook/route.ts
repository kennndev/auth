// app/api/stripe-connect-webhook/route.ts
import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Optional: pre-warm endpoint to avoid cold-start delays
export async function GET() {
  return NextResponse.json({ ok: true })
}

// Stripe instance for your MARKETPLACE tenant
const stripe = getStripeServer("market")

// Server-role client (SERVER ONLY)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") ?? ""
  const raw = Buffer.from(await req.arrayBuffer()) // raw body for signature verification
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_MARKET || process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("[connect-webhook] missing STRIPE_WEBHOOK_SECRET_MARKET")
    return new NextResponse("server misconfigured", { status: 500 })
  }

  let evt: Stripe.Event
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, webhookSecret)
  } catch (err) {
    console.error("[connect-webhook] ❌ bad signature", err)
    return new NextResponse("bad sig", { status: 400 })
  }

  // Events that may change account readiness
  const STATUS_EVENTS = new Set<Stripe.Event.Type>([
    "account.updated",
    "capability.updated",
    "person.updated",
    "account.external_account.created",
    "account.external_account.updated",
    "account.external_account.deleted",
  ])
  if (!STATUS_EVENTS.has(evt.type)) {
    return NextResponse.json({ received: true })
  }

  const acctId =
    // Connect events include the account on the top-level field
    // Fallback to nested object if needed
    (evt as any).account || (evt.data?.object as any)?.account

  if (!acctId) {
    console.warn("[connect-webhook] missing account id on event", evt.type)
    return NextResponse.json({ received: true })
  }

  // Pull fresh status from Stripe
  const acc = await stripe.accounts.retrieve(acctId)

  const verified =
    !!acc.charges_enabled &&
    !!acc.payouts_enabled &&
    ((acc.requirements?.currently_due?.length ?? 0) === 0) &&
    !acc.requirements?.disabled_reason

  // Update by stripe_account_id in marketplace profiles
  const { data, error } = await admin
    .from("mkt_profiles")
    .update({ stripe_verified: verified })
    .eq("stripe_account_id", acc.id)
    .select("id")

  if (error) console.error("[connect-webhook] DB error →", error.message)

  // Fallback: if you stored user_id in account.metadata during onboarding
  if ((data?.length ?? 0) === 0 && acc.metadata?.user_id) {
    const { error: err2 } = await admin
      .from("mkt_profiles")
      .update({ stripe_account_id: acc.id, stripe_verified: verified })
      .eq("id", acc.metadata.user_id)
    if (err2) console.error("[connect-webhook] DB error (fallback) →", err2.message)
  }

  return NextResponse.json({ received: true })
}
