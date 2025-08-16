'use client'

import { Suspense } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'

type Intent = {
  id: string
  status: string
  amount_received: number | null
}
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

function PaymentSuccessContent() {
  const params = useSearchParams()
  const id = params.get('payment_intent')

  const { data, error } = useSWR(id ? `/api/payment-intent/${id}` : null, fetcher)

  if (error) return <p className="text-red-600 break-words">Error: {String(error.message || error)}</p>
  if (!data)  return <p>Loading…</p>

  const status = data.intent?.status ?? 'unknown'
  const cents  = data.intent?.amount_received ?? 0
  const dollars = (cents / 100).toFixed(2)
  const sellerAcct = data.tx?.seller_acct ?? null

  return (
    <div className="max-w-md mx-auto mt-24 text-center space-y-4">
      <h1 className="text-2xl font-bold">Payment&nbsp;{status}</h1>
      <p>Amount: ${dollars}</p>
      <p>Payment&nbsp;Intent: {data.intent?.id ?? '—'}</p>
      {sellerAcct
        ? <p>Funds sent to seller account <code className="break-all">{sellerAcct}</code></p>
        : <p>Funds captured by platform</p>}
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
