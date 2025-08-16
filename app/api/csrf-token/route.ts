import { NextResponse } from 'next/server';
import { generateCsrfToken, CSRF_CONFIG } from '@/lib/csrf';
import { withRateLimit, RateLimitConfigs } from '@/lib/rate-limiter';

/**
 * GET handler for CSRF token endpoint
 * Generates a new CSRF token and sets it as a secure cookie
 * Returns the token to be used in request headers
 */
async function handleGetCsrfToken() {
  try {
    // Generate a new CSRF token
    const token = generateCsrfToken();
    
    // Prepare cookie options for App Router
    const cookieOptions = [
      `${CSRF_CONFIG.COOKIE_NAME}=${token}`,
      'HttpOnly',
      `Path=/`,
      `Max-Age=${CSRF_CONFIG.MAX_AGE}`,
      `SameSite=Strict`,
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');
    
    // Create response with CSRF token
    const response = NextResponse.json(
      { 
        csrfToken: token,
        message: 'CSRF token generated successfully' 
      },
      { status: 200 }
    );
    
    // Set the cookie header
    response.headers.set('Set-Cookie', cookieOptions);
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate CSRF token',
        code: 'CSRF_GENERATION_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * Export the GET handler with rate limiting
 * Using standard configuration: 60 requests per minute per IP
 */
export const GET = withRateLimit(handleGetCsrfToken, RateLimitConfigs.standard);

/**
 * Handle other HTTP methods
 * Only GET is allowed for token retrieval
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
} 