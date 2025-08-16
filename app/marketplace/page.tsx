'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Search, User as UserIcon } from "lucide-react"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { signInWithGoogle } from '@/lib/supabase-browser'

type ListingRow = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price_cents: number
  currency: string
  seller_id: string
  buyer_id: string | null
  status: 'listed' | 'sold' | 'inactive'
  is_active: boolean
  created_at: string | null
}

type SellerMeta = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

/* ───────────────────────── helpers ───────────────────────── */

const dollars = (cents: number) => (cents / 100).toFixed(2)

const initials = (name?: string | null) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || '?'
}

/* ───────────────────────── card ───────────────────────── */

function MarketplaceCard({
  listing,
  currentUserId,
  seller,
  onCancel,
  onBuy,
}: {
  listing: ListingRow
  currentUserId: string | null
  seller?: SellerMeta
  onCancel: (l: ListingRow) => Promise<void>
  onBuy: (l: ListingRow) => void
}) {
  const isSoldOrInactive = listing.status !== 'listed' || !listing.is_active
  const isSeller = !!currentUserId && currentUserId === listing.seller_id
  const priceUSD = Number(listing.price_cents) / 100

  return (
    <Card className="group bg-cyber-dark/60 border border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-300 font-mono">
      <CardContent className="p-0">
        {/* Uniform image area */}
        <div className="relative overflow-hidden rounded-t-lg aspect-[4/3]">
          <Image
            src={listing.image_url || '/placeholder.svg'}
            alt={listing.title}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority
          />
          <Badge
            className={`absolute top-2 left-2 text-xs ${
              isSoldOrInactive
                ? 'bg-red-600/70 border border-red-400/40'
                : 'bg-emerald-600/70 border border-emerald-300/40'
            }`}
          >
            {isSoldOrInactive ? 'Unavailable' : 'Available'}
          </Badge>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{listing.title}</h3>
          {listing.description && (
            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{listing.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-cyber-green">${priceUSD.toFixed(2)}</span>

            <div className="flex items-center gap-2">
              {/* Seller avatar -> seller profile page */}
<Link
  href={`/seller/${listing.seller_id}`}
  title={seller?.display_name || 'View seller'}
  className="relative grid place-items-center w-10 h-10 rounded-full overflow-hidden border-2 border-cyber-cyan hover:border-cyber-green transition-colors"
>
  {seller?.avatar_url ? (
      <Image
           src={seller.avatar_url}
      alt={seller.display_name || 'Seller'}
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-contain object-center p-2"
      />
 
  ) : (seller?.display_name && initials(seller.display_name) !== '?') ? (
    <span className="text-cyber-cyan text-sm font-bold">
      {initials(seller.display_name)}
    </span>
  ) : (
    <UserIcon className="w-5 h-5 text-cyber-cyan" />
  )}
</Link>


              {/* Action button */}
              {isSeller ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="min-w-[112px]"
                  disabled={isSoldOrInactive}
                  onClick={() => onCancel(listing)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="min-w-[112px] bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10"
                  disabled={isSoldOrInactive}
                  onClick={() => onBuy(listing)}
                >
                  Buy
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── page ───────────────────────── */

export default function MarketplacePage() {
  const router = useRouter()
  const supabase: SupabaseClient = createClientComponentClient()
  const { toast } = useToast()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<ListingRow[]>([])
  const [q, setQ] = useState('')
  const [sellerMap, setSellerMap] = useState<Record<string, SellerMeta>>({})

  // resolve session
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setUid(session?.user?.id ?? null)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user?.id ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const loadSellerMeta = useCallback(
    async (sellerIds: string[]) => {
      if (sellerIds.length === 0) return
      const uniq = Array.from(new Set(sellerIds))
      const { data, error } = await supabase
        .from('mkt_profiles')
        .select('id, display_name, avatar_url')
        .in('id', uniq)
        .returns<SellerMeta[]>()

      if (!error && data) {
        const map: Record<string, SellerMeta> = {}
        for (const s of data) map[s.id] = s
        setSellerMap(map)
      }
    },
    [supabase]
  )

  const loadListings = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('mkt_listings')
      .select('id,title,description,image_url,price_cents,currency,seller_id,buyer_id,status,is_active,created_at')
      .eq('status', 'listed')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (q.trim()) {
      const like = `%${q.trim()}%`
      query = query.or(`title.ilike.${like},description.ilike.${like}`)
    }

    const { data, error } = await query.returns<ListingRow[]>()

    if (error) {
      console.error('loadListings error:', error.message)
      setListings([])
      setLoading(false)
      return
    }

    const rows = data ?? []
    setListings(rows)
    setLoading(false)

    // fetch seller meta for avatar + name
    loadSellerMeta(rows.map(r => r.seller_id))
  }, [supabase, q, loadSellerMeta])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  const resultsText = useMemo(() => {
    if (loading) return 'Loading…'
    const n = listings.length
    return `${n} item${n === 1 ? '' : 's'} found`
  }, [loading, listings.length])

  // seller-only action
  const cancelListing = useCallback(
    async (listing: ListingRow) => {
      if (!uid || uid !== listing.seller_id) {
        toast({
          title: 'Unable to cancel',
          description: 'Only the seller can cancel this listing.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase
        .from('mkt_listings')
        .update({ status: 'inactive', is_active: false })
        .eq('id', listing.id)
        .eq('seller_id', uid)

      if (error) {
        toast({ title: 'Cancel failed', description: error.message, variant: 'destructive' })
        return
      }

      setListings(prev => prev.filter(r => r.id !== listing.id))
      toast({ title: 'Listing canceled', description: `${listing.title} removed.` })
    },
    [supabase, uid, toast]
  )

  // buy action with auth gate
  const handleBuy = useCallback(
    (listing: ListingRow) => {
      if (listing.status !== 'listed' || !listing.is_active) {
        toast({ title: 'Unavailable', description: 'This item is not currently available.', variant: 'destructive' })
        return
      }

      const checkoutUrl = `/checkout?listingId=${listing.id}`

      if (!uid) {
        signInWithGoogle(checkoutUrl)
        return
      }

      router.push(checkoutUrl)
    },
    [uid, router, toast]
  )

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* subtle grid + scanlines to match the rest of the site */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-white">Marketplace</h1>
          <p className="text-gray-400">Discover and purchase amazing cards</p>
        </div>

        {/* Search only (no price filters since price is fixed) */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search listings…"
              className="pl-10 h-12 bg-cyber-dark/60 border-cyber-cyan/30 focus:border-cyber-cyan/60 text-white"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadListings()}
            />
          </div>
          <Button
            onClick={loadListings}
            className="h-12 bg-cyber-dark border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10"
          >
            Refresh
          </Button>
        </div>

        {/* Results */}
        <p className="text-gray-400 mb-4">{resultsText}</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded border border-cyber-cyan/20 bg-cyber-dark/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((row) => (
              <MarketplaceCard
                key={row.id}
                listing={row}
                currentUserId={uid}
                seller={sellerMap[row.seller_id]}
                onCancel={cancelListing}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
