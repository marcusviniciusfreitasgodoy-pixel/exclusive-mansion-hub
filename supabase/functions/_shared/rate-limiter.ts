// Rate Limiter module for Edge Functions
// Uses PostgreSQL as persistent counter for rate limiting

import { SupabaseClient } from "npm:@supabase/supabase-js@2";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Default configurations per function
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "chatbot-message": { maxRequests: 20, windowSeconds: 60 },
  "elevenlabs-tts": { maxRequests: 10, windowSeconds: 60 },
  "generate-property-copy": { maxRequests: 5, windowSeconds: 60 },
  "send-lead-notification": { maxRequests: 10, windowSeconds: 60 },
  "send-visit-notification": { maxRequests: 10, windowSeconds: 60 },
  "send-feedback-request": { maxRequests: 10, windowSeconds: 60 },
  "default": { maxRequests: 30, windowSeconds: 60 }
};

/**
 * Check and increment rate limit for a given identifier and function
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  functionName: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config = customConfig || DEFAULT_CONFIGS[functionName] || DEFAULT_CONFIGS["default"];

  try {
    const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
      p_identifier: identifier,
      p_function_name: functionName,
      p_window_seconds: config.windowSeconds,
      p_max_requests: config.maxRequests
    });

    if (error) {
      console.error("[RateLimiter] Check error:", error);
      // Fail-open: allow request on error
      return { allowed: true, remaining: config.maxRequests, resetAt: new Date() };
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetAt: new Date(data.reset_at)
    };
  } catch (err) {
    console.error("[RateLimiter] Exception:", err);
    // Fail-open: allow request on exception
    return { allowed: true, remaining: config.maxRequests, resetAt: new Date() };
  }
}

/**
 * Create a standardized 429 Too Many Requests response
 */
export function rateLimitResponse(resetAt: Date): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
  
  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
      retry_after_seconds: retryAfter
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
      }
    }
  );
}

/**
 * Extract client identifier from request headers
 */
export function getClientIdentifier(req: Request): string {
  // Priority: X-Forwarded-For > X-Real-IP > CF-Connecting-IP > fallback
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return "unknown-client";
}

