/**
 * Client-side CSRF token management
 * Provides utilities for fetching and including CSRF tokens in API requests
 * Avoids localStorage/sessionStorage to reduce XSS risk
 */

// In-memory token storage (cleared on page refresh for security)
let csrfToken: string | null = null;
let tokenExpiry: number | null = null;

// Token refresh settings
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if the current token is still valid
 * @returns True if token exists and hasn't expired
 */
function isTokenValid(): boolean {
  if (!csrfToken || !tokenExpiry) {
    return false;
  }
  
  // Check if token will expire soon
  const now = Date.now();
  return tokenExpiry > now + TOKEN_REFRESH_THRESHOLD;
}

/**
 * Fetch a new CSRF token from the server
 * @returns Promise resolving to the CSRF token
 */
async function fetchNewToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'same-origin', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.csrfToken) {
      throw new Error('CSRF token not found in response');
    }

    // Update in-memory cache
    csrfToken = data.csrfToken;
    tokenExpiry = Date.now() + MAX_AGE;
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Clear invalid token
    csrfToken = null;
    tokenExpiry = null;
    throw error;
  }
}

/**
 * Get a valid CSRF token, fetching a new one if necessary
 * Uses in-memory caching to avoid unnecessary API calls
 * @returns Promise resolving to a valid CSRF token
 */
export async function getCsrfToken(): Promise<string> {
  // Check if we have a valid cached token
  if (isTokenValid()) {
    if (csrfToken) {
      return csrfToken;
    }
  }
  
  // Fetch new token if expired or doesn't exist
  return await fetchNewToken();
}

/**
 * Clear the cached CSRF token
 * Useful for forcing a token refresh or cleanup
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  tokenExpiry = null;
}

/**
 * Create headers object with CSRF token included
 * Convenience function for API requests
 * @param additionalHeaders - Optional additional headers to include
 * @returns Promise resolving to headers object with CSRF token
 */
export async function createCSRFHeaders(
  additionalHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    ...additionalHeaders,
  };
}

/**
 * Enhanced fetch wrapper that automatically includes CSRF token
 * For POST, PUT, DELETE, PATCH requests
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise resolving to fetch response
 */
export async function csrfFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const requiresCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (requiresCSRF) {
    const headers = await createCSRFHeaders(
      options.headers ? Object.fromEntries(new Headers(options.headers)) : {}
    );
    
    options.headers = headers;
    options.credentials = 'same-origin'; // Include cookies
  }
  
  return fetch(url, options);
}

/**
 * Get current token status for debugging
 * @returns Object with token status information
 */
export function getTokenStatus() {
  return {
    hasToken: !!csrfToken,
    isValid: isTokenValid(),
    expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    expiresIn: tokenExpiry ? Math.max(0, tokenExpiry - Date.now()) : null,
  };
}

// Export token configuration for consistency
export const CSRF_CLIENT_CONFIG = {
  TOKEN_REFRESH_THRESHOLD,
  MAX_AGE,
  HEADER_NAME: 'X-CSRF-Token',
} as const; 