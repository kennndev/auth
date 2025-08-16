'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicClient } from 'wagmi'
import { CONTRACTS } from '@/lib/contract'
import { BASE_SEPOLIA } from '@/hooks/useEnsureNetwork'

type Props = {
  collection: `0x${string}`
  id: bigint
  height?: number
}

const GATEWAYS = [
  (p: string) => `https://ipfs.io/ipfs/${p}`,
  (p: string) => `https://cloudflare-ipfs.com/ipfs/${p}`,
  (p: string) => `https://gateway.pinata.cloud/ipfs/${p}`,
  (p: string) => `https://dweb.link/ipfs/${p}`,
]

function ipfsToPath(u: string) {
  if (!u) return ''
  if (u.startsWith('ipfs://')) return u.slice('ipfs://'.length)
  if (u.startsWith('ipfs:/')) return u.slice('ipfs:/'.length)
  if (u.startsWith('ipfs://ipfs/')) return u.slice('ipfs://ipfs/'.length)
  return u
}

async function fetchWithFallback(pathOrHttp: string, timeoutMs = 6000): Promise<any> {
  const isHttp = pathOrHttp.startsWith('http')
  const candidates = isHttp
    ? [pathOrHttp]
    : GATEWAYS.map(fn => fn(ipfsToPath(pathOrHttp)))

  let lastErr: any
  for (const url of candidates) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
      clearTimeout(t)
      if (!res.ok) { lastErr = new Error(`${url} -> ${res.status}`); continue }
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) return res.json()
      return res.blob()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr ?? new Error('All IPFS gateways failed')
}

export default function NFTCard({ collection, id, height = 260 }: Props) {
  const client = usePublicClient({ chainId: BASE_SEPOLIA })
  const [img, setImg] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!client) return
    (async () => {
      try {
        const uri = await client.readContract({
          address: collection,
          abi: CONTRACTS.nftAbi,
          functionName: 'tokenURI',
          args: [id],
        }) as string

        const meta = await fetchWithFallback(uri)  // JSON
        let imageUrl: string = meta?.image || meta?.image_url || ''
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = GATEWAYS[0](ipfsToPath(imageUrl))
        }
        setImg(imageUrl || '')
        setName(meta?.name || `NFT #${id.toString()}`)
      } catch (e: any) {
        setErr(e?.message || 'Failed to load metadata')
      }
    })()
  }, [client, collection, id])

  if (err) {
    return (
      <div className="border rounded p-4 h-full flex items-center justify-center">
        <span className="text-sm text-zinc-400">No preview</span>
      </div>
    )
  }

  if (!img) return <Skeleton className="w-full" style={{ height }} />

  return (
    <div className="rounded overflow-hidden border shadow-sm">
      <div className="relative w-full h-[260px]"> {/* fixed height for all cards */}
        <Image
          src={img}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>
      <div className="p-2 text-center text-sm font-medium text-white truncate">
        {name} — #{id.toString()}
      </div>
    </div>
  )
}
