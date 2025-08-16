// app/api/refresh-stripe-status/route.ts
import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

// Server-role client (SERVER ONLY)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // renamed to match our convention
)

export async function POST(req: Request) {
  // Expect: { acct: "acct_123..." }
  const body = await req.json().catch(() => null) as { acct?: string } | null
  const acct = body?.acct?.trim()
  if (!acct || !acct.startsWith("acct_")) {
    return NextResponse.json({ error: "Invalid Stripe account id" }, { status: 400 })
  }

  // Use your MARKETPLACE Stripe account to inspect the connected account
  const stripe = getStripeServer("market")

  const acc = await stripe.accounts.retrieve(acct)
  const verified =
    !!acc.charges_enabled &&
    !!acc.payouts_enabled &&
    ((acc.requirements?.currently_due?.length ?? 0) === 0) &&
    !acc.requirements?.disabled_reason

  // Update marketplace profile row
  await admin
    .from("mkt_profiles")
    .update({ stripe_verified: verified })
    .eq("stripe_account_id", acct)

  return NextResponse.json({ verified })
}
