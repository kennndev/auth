'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type AssetRow = {
  id: string
  owner_id: string
  title: string | null
  image_url: string | null
  storage_path: string | null
  mime_type: string | null
  size_bytes: number | null
  created_at: string | null
  is_public: boolean | null
}

type ListingRow = {
  id: string
  source_id: string
  seller_id: string
  title: string
  image_url: string | null
  price_cents: number
  status: 'listed' | 'sold' | 'inactive'
  is_active: boolean
  created_at: string | null
}

type SellerMeta = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

type UIItem = {
  id: string                // asset id when known; otherwise listing id prefixed
  file_name: string
  image_url: string
  mime_type?: string | null
  uploaded_at?: string | null
  size_mb?: number | null
  is_listed: boolean
  price_cents?: number
  listing_id?: string
}

const dollars = (cents: number) => (cents / 100).toFixed(2)
const initials = (name?: string | null) =>
  (name || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'

export default function SellerGalleryPage() {
  const supabase: SupabaseClient = createClientComponentClient()
  const { sellerId = '' } = useParams() as { sellerId?: string }

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<UIItem[]>([])
  const [seller, setSeller] = useState<SellerMeta | null>(null)

  const titleId = useMemo(
    () => (sellerId ? `${sellerId.slice(0, 6)}…${sellerId.slice(-4)}` : '—'),
    [sellerId]
  )

  const load = useCallback(async () => {
    if (!sellerId) return
    setLoading(true)

    // Seller meta
    const { data: meta } = await supabase
      .from('mkt_profiles')
      .select('id, display_name, avatar_url')
      .eq('id', sellerId)
      .maybeSingle()
    if (meta) setSeller(meta as SellerMeta)

    // Public uploads (thanks to RLS policy)
    const { data: publicAssets } = await supabase
      .from('user_assets')
      .select('id, owner_id, title, image_url, storage_path, mime_type, size_bytes, created_at, is_public')
      .eq('owner_id', sellerId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .returns<AssetRow[]>()

    // Active listings
    const { data: listings } = await supabase
      .from('mkt_listings')
      .select('id, source_id, seller_id, title, image_url, price_cents, status, is_active, created_at')
      .eq('seller_id', sellerId)
      .eq('status', 'listed')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .returns<ListingRow[]>()

    // Index listings by asset id
    const listingBySource = new Map<string, ListingRow>()
    for (const l of listings ?? []) listingBySource.set(l.source_id, l)

    // 1) Start with all public assets
    const merged = new Map<string, UIItem>()
    for (const a of publicAssets ?? []) {
      const fileName = (a.title && a.title.trim()) || a.storage_path?.split('/').pop() || 'file'
      const l = listingBySource.get(a.id)
      merged.set(a.id, {
        id: a.id,
        file_name: fileName,
        image_url: a.image_url || '/placeholder.svg',
        mime_type: a.mime_type,
        uploaded_at: a.created_at,
        size_mb: a.size_bytes != null ? Number((a.size_bytes / (1024 * 1024)).toFixed(2)) : null,
        is_listed: !!l,
        price_cents: l?.price_cents,
        listing_id: l?.id,
      })
    }

    // 2) Add any listed items whose asset is not public
    for (const l of listings ?? []) {
      if (!merged.has(l.source_id)) {
        merged.set(`listing:${l.id}`, {
          id: `listing:${l.id}`,
          file_name: l.title,
          image_url: l.image_url || '/placeholder.svg',
          is_listed: true,
          price_cents: l.price_cents,
          listing_id: l.id,
        })
      }
    }

    // Sort newest first using whatever timestamp we have
    const out = Array.from(merged.values()).sort((a, b) => {
      const ta = (a.uploaded_at ? Date.parse(a.uploaded_at) : 0)
      const tb = (b.uploaded_at ? Date.parse(b.uploaded_at) : 0)
      return tb - ta
    })

    setItems(out)
    setLoading(false)
  }, [sellerId, supabase])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <div className="px-6 py-8 pt-24 relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-cyber-cyan grid place-items-center">
              {seller?.avatar_url ? (
                <Image src={seller.avatar_url} alt={seller?.display_name || 'Seller'} fill sizes="56px" className="object-cover" />
              ) : (
                <span className="text-cyber-cyan font-bold">
                  {initials(seller?.display_name) || (sellerId ? sellerId[0].toUpperCase() : 'S')}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                Id • <span className="text-cyber-cyan">{seller?.display_name || titleId}</span>
              </h1>
              <p className="text-gray-400">All cards from this seller</p>
            </div>
          </div>

          <Link href="/marketplace">
            <Button variant="outline" className="border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/10">
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-64 rounded border border-cyber-cyan/20" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-cyber-dark/60 border border-cyber-cyan/30">
            <CardContent className="p-6 text-center text-gray-400">No cards found for this seller.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <Card
                key={it.id}
                className="bg-cyber-dark/60 border border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-colors overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-cyber-cyan/20"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <Image
                      src={it.image_url || '/placeholder.svg'}
                      alt={it.file_name}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={`absolute top-3 left-3 ${it.is_listed ? 'bg-green-500/15 border border-green-500/30 text-green-400' : 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan'}`}>
                      {it.is_listed ? `For Sale • $${dollars(it.price_cents!)}` : 'Creations'}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-white font-bold truncate" title={it.file_name}>{it.file_name}</h3>
                    {it.is_listed ? (
                      <Link href={`/checkout?listingId=${it.listing_id}`}>
                        <Button className="cyber-button w-full">Buy • ${dollars(it.price_cents!)}</Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full border-cyber-cyan/40 text-cyber-cyan" disabled>
                        Not for sale
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
