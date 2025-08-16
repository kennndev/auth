// app/api/stripe/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getStripeServer } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Must be signed in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL("/login", req.url))

  // Stripe Connect returns ?account_id=acct_...
  const accountId = req.nextUrl.searchParams.get("account_id")
  if (!accountId) {
    return NextResponse.redirect(new URL("/profile?error=missing-account", req.url))
  }

  // Optional: verify status of the connected account using MARKET tenant
  let stripe_verified = false
  try {
    const stripe = getStripeServer("market")
    const acc = await stripe.accounts.retrieve(accountId)
    stripe_verified =
      !!acc.charges_enabled &&
      !!acc.payouts_enabled &&
      ((acc.requirements?.currently_due?.length ?? 0) === 0) &&
      !acc.requirements?.disabled_reason
  } catch {
    // If verification call fails, we still save the account and let /refresh-stripe-status update later
  }

  // Update the user's marketplace profile row (RLS allows user to update own row)
  const { error } = await supabase
    .from("mkt_profiles")
    .update({ stripe_account_id: accountId, stripe_verified })
    .eq("id", user.id)

  if (error) {
    return NextResponse.redirect(new URL("/profile?error=update-failed", req.url))
  }

  return NextResponse.redirect(new URL("/profile?stripe=connected", req.url))
}
