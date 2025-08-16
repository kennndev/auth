// app/api/stripe/onboard/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getStripeServer } from '@/lib/stripe'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripe = getStripeServer('market')

  // read profile
  const { data: profile } = await supabase
    .from('mkt_profiles')
    .select('stripe_account_id, stripe_verified')
    .eq('id', user.id)
    .maybeSingle()

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  let accountId = profile?.stripe_account_id ?? null

  // if accountId exists, decide: dashboard vs onboarding
  if (accountId) {
    // fetch current status to know if onboarding is still required
    let account = null as any
    try {
      account = await stripe.accounts.retrieve(accountId)
    } catch {
      // account was deleted or invalid → create fresh one below
      accountId = null
    }

    if (accountId && account) {
      const needsOnboarding =
        (account.requirements?.currently_due?.length ?? 0) > 0 ||
        !account.charges_enabled ||
        !account.payouts_enabled

      if (!needsOnboarding) {
        // already fully onboarded → return Dashboard login link (no onboarding)
        const login = await stripe.accounts.createLoginLink(accountId, {
          redirect_url: `${origin}/profile`,
        })
        return NextResponse.json({
          alreadyOnboarded: true,
          dashboardUrl: login.url,
        })
      }

      // account exists but needs more info → send onboarding link (no new account)
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: process.env.NEXT_PUBLIC_STRIPE_REFRESH_URL || `${origin}/profile`,
        return_url: process.env.NEXT_PUBLIC_STRIPE_RETURN_URL || `${origin}/profile`,
        type: 'account_onboarding',
      })
      return NextResponse.json({ alreadyOnboarded: false, url: link.url })
    }
  }

  // no valid account saved → create once and store
  const created = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: user.email ?? undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { user_id: user.id },
  })
  accountId = created.id

  await supabase.from('mkt_profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      stripe_account_id: accountId,
      stripe_verified: false,
    },
    { onConflict: 'id' },
  )

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: process.env.NEXT_PUBLIC_STRIPE_REFRESH_URL || `${origin}/profile`,
    return_url: process.env.NEXT_PUBLIC_STRIPE_RETURN_URL || `${origin}/profile`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ alreadyOnboarded: false, url: link.url })
}
