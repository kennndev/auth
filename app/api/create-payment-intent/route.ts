import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type Stripe from 'stripe'
import { getStripeServer } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

// service-role (RLS bypass)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const stripe = getStripeServer('market')
const PLATFORM_FEE_PERCENT = 5

export async function POST(req: NextRequest) {
  const { listingId } = await req.json()
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
  }

  // IMPORTANT: pass the *function* `cookies` to the helper, not a resolved store
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get listing
  const { data: listing, error: listErr } = await admin
    .from('mkt_listings')
    .select('id, price_cents, currency, status, is_active, seller_id')
    .eq('id', listingId)
    .single()

  if (listErr || !listing || !(listing.status === 'listed' && listing.is_active)) {
    return NextResponse.json({ error: 'Listing unavailable' }, { status: 409 })
  }

  // Get seller (can be null – add guard)
  const { data: seller, error: sellerErr } = await admin
    .from('mkt_profiles')
    .select('stripe_account_id, is_admin, stripe_verified')
    .eq('id', listing.seller_id)
    .maybeSingle()

  if (sellerErr) {
    return NextResponse.json({ error: 'Seller lookup failed' }, { status: 500 })
  }
  if (!seller) {
    return NextResponse.json({ error: 'Seller profile missing' }, { status: 500 })
  }

  const stripeAcct = seller.is_admin ? undefined : (seller.stripe_account_id ?? null)
  if (!seller.is_admin && (!stripeAcct || seller.stripe_verified !== true)) {
    return NextResponse.json({ error: 'Seller not connected/verified with Stripe' }, { status: 400 })
  }

  const cents = listing.price_cents
  const fee   = stripeAcct ? Math.round(cents * PLATFORM_FEE_PERCENT / 100) : undefined

  // Reuse pending tx if exists
  const { data: open } = await admin
    .from('mkt_transactions')
    .select('id, stripe_payment_id')
    .eq('listing_id', listing.id)
    .eq('buyer_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  const makePI = async (): Promise<Stripe.PaymentIntent> =>
    stripe.paymentIntents.create(
      {
        amount: cents,
        currency: (listing.currency || 'USD').toLowerCase(),
        application_fee_amount: fee,              // auto-ignored when undefined
        metadata: {
          mkt_listing_id: listing.id,
          mkt_buyer_id:   user.id,
          mkt_seller_id:  listing.seller_id,
        },
      },
      stripeAcct ? { stripeAccount: stripeAcct } : undefined
    )

  let intent: Stripe.PaymentIntent
  if (open?.stripe_payment_id) {
    intent = await stripe.paymentIntents.retrieve(
      open.stripe_payment_id,
      stripeAcct ? { stripeAccount: stripeAcct } : undefined
    )
    if (intent.status !== 'requires_payment_method') {
      intent = await makePI()
      await admin.from('mkt_transactions').update({
        stripe_payment_id : intent.id,
        seller_acct       : stripeAcct ?? null,
        platform_fee_cents: fee ?? 0,
        amount_cents      : cents,
        currency          : (listing.currency || 'USD').toUpperCase(),
      }).eq('id', open.id)
    }
  } else {
    intent = await makePI()
    await admin.from('mkt_transactions').insert({
      buyer_id          : user.id,
      listing_id        : listing.id,
      amount_cents      : cents,
      currency          : (listing.currency || 'USD').toUpperCase(),
      stripe_payment_id : intent.id,
      status            : 'pending',
      seller_acct       : stripeAcct ?? null,
      platform_fee_cents: fee ?? 0,
    })
  }

  return NextResponse.json({
    clientSecret   : intent.client_secret,
    paymentIntentId: intent.id,
    stripeAccount  : stripeAcct ?? null,
  })
}
