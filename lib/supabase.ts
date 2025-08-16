import { createClient } from '@supabase/supabase-js'
import { getRequiredEnvVar } from './env-validation'

// Validate environment variables at module load time
const supabaseUrl = getRequiredEnvVar('SUPABASE_URL')
const supabaseServiceKey = getRequiredEnvVar('SUPABASE_SERVICE_KEY')

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function getUserFromAuthHeader(authHeader?: string | null) {
  if (!authHeader) return null
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    return data.user
  } catch {
    return null
  }
}

export type WebhookEvent = {
  event_id: string
  event_type: string
  processed_at?: string
  correlation_id?: string
  created_at?: string
}

export type CustomerPurchase = {
  id?: string
  customer_id: string
  purchase_data: Record<string, unknown>
  created_at?: string
}

export type UserRightsRequest = {
  id?: string
  customer_id: string
  request_type: string
  request_data: Record<string, unknown>
  created_at?: string
}