import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getRequiredEnvVar } from '@/lib/env-validation'
import { withRateLimit, RateLimitConfigs } from '@/lib/rate-limiter'

// Initialize Supabase client with service key for server-side operations
const supabaseUrl = getRequiredEnvVar('SUPABASE_URL')
const supabaseServiceKey = getRequiredEnvVar('SUPABASE_SERVICE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const BUCKET_NAME = 'custom-uploads'

/**
 * Validate CSRF tokens for App Router
 */
function validateCSRFForAppRouter(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=')
      return [key, value]
    })
  )
  const cookieToken = cookies['csrf_token'] || null
  const headerToken = request.headers.get('x-csrf-token') || null
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  if (cookieToken.length !== headerToken.length) {
    return false
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(headerToken, 'hex')
    )
  } catch {
    return false
  }
}

/**
 * Generate a unique filename to prevent collisions
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const extension = originalFilename.split('.').pop() || 'png'
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * POST handler for uploading custom card artwork
 */
async function handleUpload(request: NextRequest) {
  // Skip CSRF for multipart/form-data uploads
  const contentType = request.headers.get('content-type') || ''
  const isMultipartUpload = contentType.includes('multipart/form-data')
  const isTestEnvironment = process.env.NODE_ENV === 'development' && request.headers.get('x-test-mode') === 'true'
  
  if (!isMultipartUpload && !isTestEnvironment && !validateCSRFForAppRouter(request)) {
    return NextResponse.json(
      { 
        error: 'CSRF validation failed',
        code: 'CSRF_INVALID'
      },
      { status: 403 }
    )
  }

  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { 
          error: 'No file provided',
          code: 'NO_FILE'
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Only PNG, JPEG, and WebP images are allowed.',
          code: 'INVALID_FILE_TYPE'
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large. Maximum size is 10MB.',
          code: 'FILE_TOO_LARGE'
        },
        { status: 400 }
      )
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name)
    
    // For now, use a session ID instead of auth user ID
    // In production, you'd get this from auth context
    const sessionId = crypto.randomBytes(16).toString('hex')
    const filePath = `uploads/${sessionId}/${uniqueFilename}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { 
          error: 'Failed to upload file',
          code: 'UPLOAD_FAILED',
          details: uploadError.message
        },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    // Store upload metadata in database
    const { data: dbData, error: dbError } = await supabase
      .from('custom_uploads')
      .insert({
        user_id: sessionId, // Using session ID as user ID for now
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      
      // Try to clean up the uploaded file
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])
      
      return NextResponse.json(
        { 
          error: 'Failed to save upload metadata',
          code: 'DB_ERROR',
          details: dbError.message
        },
        { status: 500 }
      )
    }

    // Return success response with upload details
    return NextResponse.json({
      success: true,
      url: publicUrl,
      data: {
        uploadId: dbData.id,
        publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: dbData.uploaded_at
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Export the POST handler with rate limiting
 * Using strict configuration for uploads: 10 requests per minute per IP
 */
export const POST = withRateLimit(handleUpload, RateLimitConfigs.strict);

/**
 * GET handler - not supported for uploads
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  )
}