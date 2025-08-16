/**
 * Environment variable validation utility
 * Validates required environment variables at startup to prevent runtime crashes
 */

interface EnvConfig {
  required: string[];
  optional?: string[];
}

/**
 * Validates that required environment variables are present
 * @param config - Configuration object with required and optional env vars
 * @throws Error if any required environment variables are missing
 */
export function validateEnv(config: EnvConfig): void {
  const missing: string[] = [];

  for (const envVar of config.required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${errorMessage}`);
    
    // In development, provide helpful instructions
    if (process.env.NODE_ENV === 'development') {
      console.error('📝 Please create a .env.local file with the required variables.');
      console.error('📚 Check the documentation for more information.');
    }
    
    throw new Error(errorMessage);
  }

  // Log successful validation in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ All required environment variables are present');
  }
}

/**
 * Gets an environment variable value with validation
 * @param key - The environment variable key
 * @param fallback - Optional fallback value if the variable is not set
 * @returns The environment variable value or fallback
 * @throws Error if the variable is not set and no fallback is provided
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value || fallback!;
}

/**
 * Gets a required environment variable value
 * @param key - The environment variable key
 * @returns The environment variable value
 * @throws Error if the variable is not set
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Common environment variables used in the application
 */
export const ENV_VARS = {
  // Supabase
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_SERVICE_KEY: 'SUPABASE_SERVICE_KEY',
  NEXT_PUBLIC_SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  
  // Stripe
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  
  // Vercel
  VERCEL_URL: 'VERCEL_URL',
  
  // Node
  NODE_ENV: 'NODE_ENV',
} as const;