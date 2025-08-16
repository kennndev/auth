// lib/supabase-admin.ts (SERVER ONLY)
import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY! // service role
export const supabaseAdmin = createClient(url, serviceKey)
