import { NextResponse, type NextRequest } from 'next/server'
import { getStripeServer } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const stripe = getStripeServer('market')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: tx, error } = await admin
    .from('mkt_transactions')
    .select('seller_acct')
    .eq('stripe_payment_id', id)
    .single()

  if (error || !tx) {
    return NextResponse.json({ error: 'Tx not found' }, { status: 404 })
  }

  const intent = await stripe.paymentIntents.retrieve(
    id,
    tx.seller_acct ? { stripeAccount: tx.seller_acct } : undefined
  )

  return NextResponse.json({ intent, tx })
}
