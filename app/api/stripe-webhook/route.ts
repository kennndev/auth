// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { getStripeServer } from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// ---- Supabase (service role: bypasses RLS) ----
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ---- Stripe (your marketplace/platform account) ----
const stripe = getStripeServer("market")

/* ───────────────── helpers ───────────────── */

async function markSellerReadiness(acct: Stripe.Account) {
  const verified =
    acct.charges_enabled === true &&
    acct.payouts_enabled === true &&
    ((acct.requirements?.currently_due ?? []).length === 0)

  const userId = (acct.metadata as any)?.user_id as string | undefined

  if (userId) {
    await admin.from("mkt_profiles").upsert(
      {
        id: userId,
        email: null,
        stripe_account_id: acct.id,
        stripe_verified: verified,
        is_seller: verified,
      },
      { onConflict: "id" }
    )
  }

  await admin
    .from("mkt_profiles")
    .update({ stripe_verified: verified, is_seller: verified })
    .eq("stripe_account_id", acct.id)
}

/**
 * Transfer asset ownership to the buyer after a successful sale.
 * Supports both models:
 * - New:    listing.source_type = 'asset' and source_id = user_assets.id
 * - Legacy: listing.source_type = 'uploaded_image' and user_assets row is
 *           (source_type='uploaded_image', source_id=<upload id>)
 */
async function transferAssetToBuyer(listingId: string, buyerId: string) {
  const { data: listing, error } = await admin
    .from("mkt_listings")
    .select("id, source_type, source_id")
    .eq("id", listingId)
    .single()

  if (error || !listing) {
    console.warn("[wh] transferAsset: listing not found", listingId, error?.message)
    return
  }

  if (listing.source_type === "asset") {
    const { error: upErr } = await admin
      .from("user_assets")
      .update({ owner_id: buyerId })
      .eq("id", listing.source_id)
    if (upErr) console.error("[wh] transferAsset (asset) err:", upErr.message)
    else console.log("[wh] transferAsset (asset) OK", listing.source_id, "→", buyerId)
    return
  }

  // legacy mapping
  const { error: upErr2 } = await admin
    .from("user_assets")
    .update({ owner_id: buyerId })
    .eq("source_type", "uploaded_image")
    .eq("source_id", listing.source_id)

  if (upErr2) console.error("[wh] transferAsset (uploaded_image) err:", upErr2.message)
  else console.log("[wh] transferAsset (uploaded_image) OK", listing.source_id, "→", buyerId)
}



async function queuePayoutIfPossible(
  listingId: string,
  sellerId?: string | null,
  netCents?: number
) {
  if (!sellerId || !netCents || netCents <= 0) return

  const { data: seller, error: sellerErr } = await admin
    .from("mkt_profiles")
    .select("stripe_account_id")
    .eq("id", sellerId)
    .single()

  if (sellerErr) {
    console.error("[wh] seller fetch err:", sellerErr.message)
    return
  }
  if (!seller?.stripe_account_id) return

  const when = new Date(Date.now() + 10 * 60 * 1000) // T+10 min (demo)
  const { error: payoutErr } = await admin.from("mkt_payouts").insert({
    listing_id: listingId,
    stripe_account_id: seller.stripe_account_id,
    amount_cents: netCents,
    scheduled_at: when.toISOString(),
    status: "pending",
  })

  if (payoutErr) console.error("[wh] payout insert err:", payoutErr.message)
  else console.log("[wh] payout queued:", listingId, netCents)
}

// 1) extra helpers
async function markTxFailed(stripeId: string, listingId?: string, buyerId?: string) {
  // mark tx failed
  await admin
    .from("mkt_transactions")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("stripe_payment_id", stripeId)

  // put listing back to active if we pessimistically reserved it
  if (listingId) {
    await admin
      .from("mkt_listings")
      .update({ buyer_id: null, status: "active", is_active: true, updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("buyer_id", buyerId ?? null) // only if we had set this buyer
  }
}

// 2) succeed handler: VERIFY then transfer
async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  // Always re-fetch to be 100% sure and to get the latest captured amounts
  const fresh = await stripe.paymentIntents.retrieve(pi.id)
  if (fresh.status !== "succeeded") {
    console.warn("[wh] PI not succeeded after refetch →", fresh.status)
    return
  }

  const md = (fresh.metadata ?? {}) as any
  const listingId = md.mkt_listing_id as string | undefined
  const buyerId   = md.mkt_buyer_id   as string | undefined
  const sellerId  = md.mkt_seller_id  as string | undefined
  if (!listingId || !buyerId) {
    console.warn("[wh] PI missing metadata", { listingId, buyerId, md })
    return
  }

  const stripeId = fresh.id
  const amountCents = Number(fresh.amount_received ?? fresh.amount)
  const platformFeeCents = Number(fresh.application_fee_amount ?? 0)
  const netCents = Math.max(0, amountCents - platformFeeCents)

  // 1) complete transaction (by stripe id, else fallback)
  const { data: tx1, error: tx1Err } = await admin
    .from("mkt_transactions")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("stripe_payment_id", stripeId)
    .select("id")
  if (tx1Err) console.error("[wh] tx by stripe_id error:", tx1Err.message)

  if (!tx1?.length) {
    const { error: tx2Err } = await admin
      .from("mkt_transactions")
      .update({
        status: "completed",
        stripe_payment_id: stripeId,
        updated_at: new Date().toISOString(),
      })
      .eq("listing_id", listingId)
      .eq("buyer_id", buyerId)
      .eq("status", "pending")
    if (tx2Err) console.error("[wh] tx fallback error:", tx2Err.message)
  }

  // 2) mark listing sold
  const { error: listErr } = await admin
    .from("mkt_listings")
    .update({
      buyer_id: buyerId,
      status: "sold",
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
  if (listErr) console.error("[wh] listing update err:", listErr.message)

  // 3) transfer ownership
  await transferAssetToBuyer(listingId, buyerId)

  // 4) queue payout
  await queuePayoutIfPossible(listingId, sellerId, netCents)
}

// 3) NEW: failure/void/refund handlers → mark failed & unlock listing
async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const md = (pi.metadata ?? {}) as any
  await markTxFailed(pi.id, md.mkt_listing_id, md.mkt_buyer_id)
}

async function handleChargeRefunded(ch: Stripe.Charge) {
  // optional: treat refund as a failure after the fact (if you want to re-open the listing)
  const piId = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id
  await markTxFailed(piId ?? "")
}

// 4) route switch: add failure cases
export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer())
  const sig = req.headers.get("stripe-signature") ?? ""
  const primary = process.env.STRIPE_WEBHOOK_SECRET
  const connect = process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  if (!primary && !connect) return new NextResponse("webhook secret missing", { status: 500 })

  let event: Stripe.Event
  try {
    if (!primary) throw new Error("skip primary")
    event = stripe.webhooks.constructEvent(rawBody, sig, primary)
  } catch (e1) {
    if (!connect) return new NextResponse("bad sig", { status: 400 })
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, connect)
    } catch {
      return new NextResponse("bad sig", { status: 400 })
    }
  }

  try {
    switch (event.type) {
      // SUCCESS paths (safe to transfer)
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      // FAILURE / NO-TRANSFER paths
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      // If you use async payment methods via Checkout:
      case "checkout.session.async_payment_failed":
        {
          const s = event.data.object as Stripe.Checkout.Session
          const md = (s.metadata ?? {}) as any
          await markTxFailed(
            typeof s.payment_intent === "string"
              ? s.payment_intent
              : s.payment_intent?.id ?? s.id,
            md?.mkt_listing_id,
            md?.mkt_buyer_id
          )
        }
        break

      // Optional: refunds → mark failed/returned (your policy)
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      // Seller onboarding status (unchanged)
      case "account.updated":
      case "capability.updated":
      case "account.application.authorized":
        await markSellerReadiness(event.data.object as Stripe.Account)
        break

      default:
        break
    }
  } catch (err) {
    console.error("[wh] handler error:", err)
  }

  return NextResponse.json({ received: true })
}

