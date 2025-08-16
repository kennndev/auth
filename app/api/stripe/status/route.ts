// app/api/stripe/status/route.ts
import { getStripeServer } from "@/lib/stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies} from 'next/headers'
import { NextResponse } from "next/server"


export async function GET() {

  const cookieStore = await cookies(); // ✅ now a ReadonlyRequestCookies
  const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stripe = getStripeServer("market")

  const { data: profile, error: profileErr } = await supabase
    .from("mkt_profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single()

  if (profileErr) {
    return NextResponse.json({ error: "Profile fetch failed" }, { status: 500 })
  }

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ connected: false })
  }

  const account = await stripe.accounts.retrieve(profile.stripe_account_id)

  // Not finished onboarding? Send another onboarding link
  if (!account.details_submitted) {
    const onboardingLink = await stripe.accountLinks.create({
      account: profile.stripe_account_id,
      type: "account_onboarding",
      refresh_url: process.env.NEXT_PUBLIC_STRIPE_REFRESH_URL || "http://localhost:3000/reauth",
      return_url: process.env.NEXT_PUBLIC_STRIPE_RETURN_URL || "http://localhost:3000/profile",
    })
    return NextResponse.json({
      connected: true,
      onboarding_complete: false,
      onboarding_url: onboardingLink.url,
    })
  }

  // Finished onboarding → return a dashboard login link
  const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)
  return NextResponse.json({
    connected: true,
    onboarding_complete: true,
    login_url: loginLink.url,
  })
}
