'use client'

import { Suspense } from 'react'
import useSWR from 'swr'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Clock, CreditCard, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

type Intent = { id: string; status: string; amount_received: number | null }
type Tx = { seller_acct: string | null }
type ApiResp = { intent: Intent; tx: Tx }

const fetcher = async (url: string): Promise<ApiResp> => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || `HTTP ${res.status}`)
  }
  const json = await res.json()
  if (!json?.intent) throw new Error('Missing intent in response')
  return json as ApiResp
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const base = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide'
  if (s === 'succeeded') {
    return (
      <span className={`${base} bg-cyber-green/15 text-cyber-green border border-cyber-green/30`}>
        <CheckCircle2 className="h-4 w-4" /> Succeeded
      </span>
    )
  }
  if (s === 'processing' || s === 'requires_action' || s === 'requires_confirmation') {
    return (
      <span className={`${base} bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30`}>
        <Clock className="h-4 w-4" /> Processing
      </span>
    )
  }
  return (
    <span className={`${base} bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30`}>
      <XCircle className="h-4 w-4" /> {status}
    </span>
  )
}

function Line({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
      <span className="text-sm text-gray-300">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono break-all text-gray-200' : 'font-semibold text-white'}`}>
        {value}
      </span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Loader2 className="h-6 w-6 animate-spin text-cyber-cyan" />
      <p className="text-sm text-gray-400">Finalizing your payment…</p>
    </div>
  )
}

function PaymentSuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('payment_intent')

  const { data, error } = useSWR(id ? `/api/payment-intent/${id}` : null, fetcher)

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-cyber-pink/40 bg-cyber-dark/60 p-6 backdrop-blur">
          <div className="mb-4 flex items-center gap-3 text-cyber-pink">
            <XCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold tracking-wide">Payment Error</h2>
          </div>
          <p className="break-words text-sm text-gray-300">{String((error as any).message || error)}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push('/')}
              className="cyber-button inline-flex items-center gap-2 rounded-lg border border-cyber-cyan/40 bg-cyber-dark/40 px-4 py-2 text-sm text-cyber-cyan hover:bg-cyber-dark/60"
            >
              Go Home <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <Skeleton />

  const status = data.intent?.status ?? 'unknown'
  const cents = data.intent?.amount_received ?? 0
  const dollars = (cents / 100).toFixed(2)
  const sellerAcct = data.tx?.seller_acct ?? null
  const success = status.toLowerCase() === 'succeeded'

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-widest">
          <span className="text-cyber-cyan">Cardify</span> Payment
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-dark/60 px-3 py-1 text-xs text-cyber-cyan">
          <ShieldCheck className="h-4 w-4" />
          Secured
        </div>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber-cyan/25 bg-cyber-dark/50 shadow-xl backdrop-blur">
        {/* neon frame */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyber-cyan/15" />

        <div className="border-b border-cyber-cyan/20 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyber-cyan/30 bg-cyber-dark/60">
                <CreditCard className="h-5 w-5 text-cyber-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-wide">Checkout Result</h2>
                <p className="text-xs text-gray-400">Here’s the final status from Stripe</p>
              </div>
            </div>

            <StatusBadge status={status} />
          </div>
        </div>

        <div className="space-y-3 px-6 py-6">
          <Line label="Amount" value={`$${dollars}`} />
          <Line label="Payment Intent" value={data.intent?.id ?? '—'} mono />
          {sellerAcct ? (
            <Line label="Destination" value={`Seller • ${sellerAcct}`} mono />
          ) : (
            <Line label="Destination" value="Platform (no connected account)" />
          )}

          {success ? (
            <div className="mt-2 rounded-lg border border-cyber-green/30 bg-cyber-green/10 px-4 py-3 text-sm text-cyber-green">
              Funds captured. Your purchase is complete.
            </div>
          ) : (
            <div className="mt-2 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 px-4 py-3 text-sm text-cyber-cyan">
              If this stays in processing, you’ll see an update here soon.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => router.push('/profile')}
              className="cyber-button inline-flex items-center justify-center gap-2 rounded-lg border border-cyber-cyan/40 bg-cyber-dark/40 px-4 py-2.5 text-sm font-medium text-cyber-cyan hover:bg-cyber-dark/60"
            >
              View Your Items <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyber-cyan/90 px-4 py-2.5 text-sm font-semibold text-cyber-black hover:bg-cyber-cyan"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-gray-500">
        Need help? Contact support with your payment intent ID.
      </p>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <div className="relative min-h-screen bg-cyber-black text-white">
      {/* Background effects to match your theme */}
      <div className="pointer-events-none fixed inset-0 cyber-grid opacity-10" />
      <div className="pointer-events-none fixed inset-0 scanlines opacity-15" />

      <div className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<Skeleton />}>
            <PaymentSuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
