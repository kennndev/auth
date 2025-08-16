// hooks/use-credits.ts
"use client"
import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function useCredits() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const sb = getSupabaseBrowserClient()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { setBalance(null); setLoading(false); return }
      const { data, error } = await sb
        .from("mkt_profiles")
        .select("credits")
        .eq("id", user.id)
        .maybeSingle()
      if (error) throw error
      setBalance(Number(data?.credits ?? 0))
    } finally {
      setLoading(false)
    }
  }, [sb])

  useEffect(() => {
    load()
    const sub = sb.auth.onAuthStateChange(() => load())
    return () => sub.data.subscription.unsubscribe()
  }, [load, sb])

  // realtime on profile row
  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const ch = sb.channel(`credits-${user.id}`)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "mkt_profiles", filter: `id=eq.${user.id}` },
          load
        ).subscribe()
      return () => { sb.removeChannel(ch) }
    })()
  }, [sb, load])

  return { balance, loading }
}
