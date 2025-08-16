/**
 * Simple in-memory rate limiter for API routes
 * This provides basic protection against abuse without external dependencies
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;  // Custom error message
  skipSuccessfulRequests?: boolean;  // Only count failed requests
  keyGenerator?: (req: NextRequest) => string;  // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store for rate limit data (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Default key generator - uses IP address or x-forwarded-for header
 */
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const path = new URL(req.url).pathname;
  return `${ip}:${path}`;
}

/**
 * Rate limiter middleware for Next.js API routes
 * @param config - Rate limiting configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }
    
    // Increment counter (might be decremented later if skipSuccessfulRequests is true)
    entry.count++;
    
    // Process the request
    const response = await handler();
    
    // If configured to skip successful requests and this was successful, decrement
    if (skipSuccessfulRequests && response.status < 400) {
      entry.count--;
    }
    
    // Add rate limit headers to successful responses
    if (response.status < 400) {
      const remaining = Math.max(0, maxRequests - entry.count);
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    }
    
    return response;
  };
}

/**
 * Common rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limit for sensitive operations (10 requests per minute)
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  
  // Standard rate limit for API endpoints (60 requests per minute)
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
  
  // Relaxed rate limit for read operations (120 requests per minute)
  relaxed: {
    windowMs: 60 * 1000,
    maxRequests: 120,
  },
  
  // Auth endpoints (5 attempts per 15 minutes)
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts. Please try again later.',
  },
  
  // Checkout sessions (20 per 5 minutes per IP)
  checkout: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 20,
    message: 'Too many checkout attempts. Please wait a few minutes and try again.',
  },
};

/**
 * Helper function to wrap an API handler with rate limiting
 * @param handler - The API handler function
 * @param config - Rate limit configuration (defaults to standard)
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = RateLimitConfigs.standard
) {
  const limiter = rateLimit(config);
  
  return async function rateLimitedHandler(req: NextRequest): Promise<NextResponse> {
    return limiter(req, () => handler(req));
  };
}