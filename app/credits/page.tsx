"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const PACKS = [
  { usd: 20, images: 80, tag: "Starter" },
  { usd: 40, images: 160, tag: "Popular" },
  { usd: 60, images: 240, tag: "Best Value" },
] as const

export default function CreditsPage() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [uid, setUid] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUid(session?.user?.id ?? null))
  }, [supabase])

  const buy = async (usd: number) => {
    if (!uid) {
      toast({ title: "Sign in required", description: "Please sign in to buy credits.", variant: "destructive" })
      return
    }
    setBusy(usd)
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usd }),
      })
      const json = await res.json()
      if (!res.ok || !json?.url) {
        toast({ title: "Checkout failed", description: json?.error ?? "Unexpected error", variant: "destructive" })
        setBusy(null)
        return
      }
      window.location.href = json.url as string
    } catch (e: any) {
      toast({ title: "Checkout failed", description: String(e?.message ?? e), variant: "destructive" })
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">Buy Credits</h1>
            <p className="text-gray-400">$1 = 4 image generations</p>
          </div>
          <Link href="/profile"><Button className="cyber-button">Back to Profile</Button></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKS.map(p => (
            <Card key={p.usd} className="bg-cyber-dark/60 border border-cyber-cyan/30 hover:border-cyber-cyan/60">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-white">${p.usd} Pack</CardTitle>
                <Badge className="bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan">{p.tag}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-4xl font-extrabold text-white">{p.images}</div>
                <div className="text-sm text-gray-400">images included</div>
                <Button className="cyber-button w-full" onClick={() => buy(p.usd)} disabled={busy === p.usd}>
                  {busy === p.usd ? "Starting…" : `Buy for $${p.usd}`}
                </Button>
                <div className="text-xs text-gray-500">~ ${(p.usd / p.images).toFixed(2)} per image</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
