import { getStripeServer} from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect('http://localhost:3000/auth/signin') // or your signin page
  }

  const userId = user.id
      const stripe = getStripeServer('market'); 
  

  // Check if Stripe already connected
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_account_id) {
    return NextResponse.redirect('http://localhost:3000/dashboard')
  }

  // Create Stripe account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: user.email!,
    capabilities: {
      transfers: { requested: true },
    },
  })

  // Store account ID
  await supabase
    .from('profiles')
    .update({ stripe_account_id: account.id })
    .eq('id', userId)

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'http://localhost:3000/reauth',
    return_url: 'http://localhost:3000/dashboard',
    type: 'account_onboarding',
  })

  return NextResponse.redirect(accountLink.url)
}
