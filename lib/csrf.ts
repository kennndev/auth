import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { serialize, parse } from 'cookie';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32; // 256 bits (32 bytes)
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_MAX_AGE = 60 * 60; // 1 hour in seconds

/**
 * Generate a cryptographically strong CSRF token
 * Uses Node.js crypto.randomBytes to ensure unpredictability
 * @returns A 64-character hex string (256 bits of entropy)
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in HTTP-only secure cookie
 * Configures cookie with appropriate security attributes
 * @param res - Next.js API response object
 * @returns The generated CSRF token
 */
export function setCsrfCookie(res: NextApiResponse): string {
  const token = generateCsrfToken();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  };
  
  res.setHeader('Set-Cookie', serialize(CSRF_COOKIE_NAME, token, cookieOptions));
  
  return token;
}

/**
 * Extract CSRF token from request cookies
 * @param req - Next.js API request object
 * @returns The CSRF token or null if not found
 */
export function getCsrfTokenFromCookies(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || '');
  return cookies[CSRF_COOKIE_NAME] || null;
}

/**
 * Extract CSRF token from request headers
 * @param req - Next.js API request object
 * @returns The CSRF token or null if not found
 */
export function getCsrfTokenFromHeaders(req: NextApiRequest): string | null {
  return (req.headers[CSRF_HEADER_NAME] as string) || null;
}

/**
 * Validate CSRF token using constant-time comparison
 * Compares the token from cookies with the token from headers
 * @param req - Next.js API request object
 * @returns True if tokens match, false otherwise
 */
export function validateCSRF(req: NextApiRequest): boolean {
  const cookieToken = getCsrfTokenFromCookies(req);
  const headerToken = getCsrfTokenFromHeaders(req);
  
  // Both tokens must be present
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Both tokens must be the same length to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }
  
  try {
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(headerToken, 'hex')
    );
  } catch (error) {
    // If there's an error (e.g., invalid hex), tokens don't match
    console.error('CSRF token validation error:', error);
    return false;
  }
}

/**
 * CSRF protection middleware for API routes
 * Validates CSRF tokens for state-changing HTTP methods
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @param next - Optional callback to continue processing
 * @returns True if validation passes, false otherwise
 */
export function csrfProtection(
  req: NextApiRequest, 
  res: NextApiResponse,
  next?: () => void
): boolean {
  // Only validate CSRF for state-changing methods
  const methodsRequiringCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!methodsRequiringCSRF.includes(req.method || '')) {
    if (next) next();
    return true;
  }
  
  if (!validateCSRF(req)) {
    res.status(403).json({ 
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_VALIDATION_FAILED'
    });
    return false;
  }
  
  if (next) next();
  return true;
}

// Export constants for use in other modules
export const CSRF_CONFIG = {
  TOKEN_LENGTH: CSRF_TOKEN_LENGTH,
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  MAX_AGE: TOKEN_MAX_AGE,
} as const; 