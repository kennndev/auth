// lib/supabase-browser.ts
"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

let browserClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClientComponentClient()
  }
  return browserClient
}

/** OAuth login */
export async function signInWithGoogle(nextPath = "/") {
  const supabase = getSupabaseBrowserClient()
  const origin = window.location.origin
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
  })
}

/** Sign out and go home */
export async function signOutUser() {
  const supabase = getSupabaseBrowserClient()
  await supabase.auth.signOut()
  window.location.href = "/"
}
