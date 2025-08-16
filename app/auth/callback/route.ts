// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  // safe redirect
  const redirectUrl = next.startsWith("/") ? `${origin}${next}` : origin

  if (code) {
    // NOTE: pass a *sync* function returning the cookie store
    const supabase = createRouteHandlerClient({
      cookies: () => cookies(),
    })

    await supabase.auth.exchangeCodeForSession(code) // sets session cookie
  }

  return NextResponse.redirect(redirectUrl)
}
