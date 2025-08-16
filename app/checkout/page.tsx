'use client'

import { useEffect, useMemo, useState } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Lock, CreditCard, Loader2 } from 'lucide-react'

/** Load Stripe for the (optional) connected account */
function useStripeLoader(acct: string | null) {
  return useMemo<Promise<Stripe | null>>(
    () =>
      loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        acct ? { stripeAccount: acct } : undefined
      ),
    [acct]
  )
}

function CheckoutForm({ paymentIntentId }: { paymentIntentId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)

    const { error: submitErr } = await elements.submit()
    if (submitErr) {
      toast({ title: 'Input error', description: submitErr.message, variant: 'destructive' })
      setBusy(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${location.origin}/payment-success?payment_intent=${paymentIntentId}`,
      },
      redirect: 'if_required',
    })

    if (error) {
      toast({ title: 'Payment failed', description: error.message, variant: 'destructive' })
    } else if (paymentIntent?.status === 'succeeded') {
      router.push(`/payment-success?payment_intent=${paymentIntent.id}`)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-cyber-cyan/30 bg-cyber-dark/60 p-4 backdrop-blur-sm">
        <PaymentElement />
      </div>

      <Button
        disabled={!stripe || busy}
        className="cyber-button w-full text-base py-5 tracking-wider"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing…
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Complete Payment
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4 text-cyber-green" />
        <span>Secure checkout</span>
        <span className="text-gray-600">•</span>
        <Lock className="h-4 w-4 text-cyber-cyan" />
        <span>PCI-compliant • 256-bit TLS</span>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [stripeAcct, setStripeAcct] = useState<string | null>(null)

  const params = useSearchParams()
  const listingId = params.get('listingId')

  const stripePromise = useStripeLoader(stripeAcct)

  useEffect(() => {
    if (!listingId) return

    ;(async () => {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId }),
        })

        if (!res.ok) {
          console.error('[create-payment-intent]', await res.text())
          return
        }

        const { clientSecret, paymentIntentId, stripeAccount } = await res.json()
        setClientSecret(clientSecret)
        setPaymentIntentId(paymentIntentId)
        setStripeAcct(stripeAccount ?? null) // null -> platform, acct_... -> connected account
      } catch (e) {
        console.error('[checkout] failed to create PI', e)
      }
    })()
  }, [listingId])

  // Stripe Elements appearance tuned to your theme
  const options =
    clientSecret
      ? {
          clientSecret,
          appearance: {
            theme: 'night' as const,
            variables: {
              colorPrimary: '#00F7FF',   // cyber-cyan
              colorBackground: '#0B0F13', // cyber-black-ish
              colorText: '#E5E7EB',
              colorDanger: '#FF4D6D',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              borderRadius: '12px',
            },
            rules: {
              '.Input': {
                borderColor: 'rgba(0, 255, 234, 0.35)',
                boxShadow: '0 0 0 0.5px rgba(0, 255, 234, 0.35)',
                backgroundColor: 'rgba(20, 28, 38, 0.6)',
              },
              '.Input:focus': {
                boxShadow: '0 0 0 1.5px rgba(0, 255, 234, 0.65)',
              },
              '.Tab, .StepperItem': {
                borderColor: 'rgba(0, 255, 234, 0.25)',
              },
            },
          },
        }
      : undefined

  return (
    <div className="relative min-h-screen bg-cyber-black text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 cyber-grid opacity-10" />
      <div className="pointer-events-none fixed inset-0 scanlines opacity-15" />

      <div className="mx-auto max-w-3xl px-4 py-20">
        {/* Header / Title */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="tracking-widest text-3xl font-bold">
            <span className="text-cyber-cyan">Cardify</span> Checkout
          </h1>

          <div className="rounded-full border border-cyber-cyan/40 bg-cyber-dark/60 px-3 py-1 text-xs text-cyber-cyan">
            Live • Encrypted
          </div>
        </div>

        {/* Main Card */}
        <Card className="relative overflow-hidden border border-cyber-cyan/30 bg-cyber-dark/50 backdrop-blur-md">
          {/* subtle neon frame */}
          <div className="pointer-events-none absolute -inset-px rounded-xl ring-1 ring-cyber-cyan/20" />
          <CardHeader className="border-b border-cyber-cyan/20">
            <CardTitle className="flex items-center justify-center gap-2 text-center text-2xl tracking-wider">
              <CreditCard className="h-6 w-6 text-cyber-cyan" />
              Complete Your Purchase
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {clientSecret && options ? (
              <Elements stripe={stripePromise} options={options} key={clientSecret}>
                <CheckoutForm paymentIntentId={paymentIntentId} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-16 text-cyber-cyan/80">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading payment form…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footnote */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By completing this purchase, you agree to our{' '}
          <a className="text-cyber-cyan underline hover:text-cyber-pink" href="/terms" target="_blank" rel="noreferrer">
            Terms
          </a>{' '}
          and{' '}
          <a className="text-cyber-cyan underline hover:text-cyber-pink" href="/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
