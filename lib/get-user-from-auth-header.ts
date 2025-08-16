// lib/get-user-from-auth-header.ts (SERVER ONLY)
import { createClient } from '@supabase/supabase-js'

export async function getUserFromAuthHeader(authHeader?: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  // use anon key for token introspection
  const anon = createClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await anon.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}
