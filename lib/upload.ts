"use client"

import { getSupabaseBrowserClient } from "./supabase-browser"

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

type ProfileRow = { credits: number | null }

export async function uploadToSupabase(file: Blob | File, customPath?: string) {
  const supabase = getSupabaseBrowserClient()

  // Require a real session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error("not_signed_in")

  const userId = session.user.id
  const userEmail = session.user.email ?? null

  // 1) Preflight: ensure at least 1 credit (soft—DB trigger still enforces)
  try {
    const { data: prof, error: profErr } = await supabase
      .from("mkt_profiles")
      .select("credits")
      .eq("id", userId)
      .single<ProfileRow>()

    if (profErr) {
      console.warn("[upload] preflight credits read failed:", profErr)
    } else {
      const balance = Number(prof?.credits ?? 0)
      if (balance <= 0) throw new Error("no_credits")
    }
  } catch (e) {
    if ((e as Error).message === "no_credits") throw e
    // fall through; DB trigger remains the source of truth
  }

  const name = (file as File).name || "uploaded"
  const mime = (file as File).type || "application/octet-stream"
  const extFromMime = mimeToExt[mime]
  const extFromName = name.includes(".") ? name.split(".").pop()!.toLowerCase() : ""
  const ext = (extFromMime || extFromName || "bin").replace(/[^a-z0-9]/g, "")

  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const safeCustom = (customPath || "").replace(/^\/+/, "").replace(/\.\./g, "")
  const baseDir = `uploads/${userId}`
  const storagePath = safeCustom ? `${baseDir}/${safeCustom}/${fileName}` : `${baseDir}/${fileName}`

  console.log("📤 Uploading:", { storagePath, mime, size: (file as File).size })

  // 2) Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("custom-uploads")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: mime,
    })
  if (uploadError) throw uploadError

  // Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from("custom-uploads")
    .getPublicUrl(storagePath)

  // 3) Insert DB row – trigger spends 1 credit or rejects with 'insufficient_credits'
  const { data: imageRecord, error: dbError } = await supabase
    .from("uploaded_images")
    .insert({
      image_url: publicUrl,
      storage_path: storagePath,
      file_size_bytes: (file as File).size ?? null,
      file_type: mime,
      user_email: userEmail,
      user_id: userId,
      metadata: {
        original_filename: name,
        upload_source: "custom_card_upload",
        timestamp: new Date().toISOString(),
      },
    })
    .select()
    .single()

  // 4) If credits were insufficient, remove the file and surface a friendly error
  if (dbError) {
    const msg = String(dbError.message || dbError)
    const noCredits = msg.includes("insufficient_credits")
    if (noCredits) {
      try {
        await supabase.storage.from("custom-uploads").remove([storagePath])
      } catch (cleanupErr) {
        console.warn("[upload] cleanup after insufficient_credits failed:", cleanupErr)
      }
      throw new Error("no_credits")
    }

    console.warn("DB insert failed (upload ok):", dbError)
    throw dbError
  }

  // 5) Fetch fresh credits and broadcast to all listeners (navbar, etc.)
  try {
    const { data: prof2 } = await supabase
      .from("mkt_profiles")
      .select("credits")
      .eq("id", userId)
      .maybeSingle<ProfileRow>()

    const freshCredits = Number(prof2?.credits ?? 0)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cardify-credits-updated", { detail: { credits: freshCredits } })
      )
    }
  } catch (e) {
    console.warn("[upload] post-insert credits refresh failed:", e)
  }

  return { publicUrl, storagePath, imageRecordId: imageRecord?.id ?? null }
}
