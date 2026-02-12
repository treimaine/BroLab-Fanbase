/**
 * API Rate Limiting Helper
 * 
 * Provides middleware-like function to apply rate limiting to API routes.
 * Logs rate limit violations for security monitoring.
 */

import { NextRequest, NextResponse } from "next/server";
import rateLimiter from "./rate-limiter";
import { logSecurityEvent } from "./security-logger";

/**
 * Get client identifier from request
 * Uses IP address, falling back to a default for local development
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to localhost for development
  return "127.0.0.1";
}

/**
 * Apply rate limiting to an API route
 * 
 * @param req - Next.js request object
 * @param config - Rate limit configuration
 * @returns Object with rate limit info or NextResponse with 429 status if rate limited
 */
export async function applyRateLimit(
  req: NextRequest,
  config: { limit: number; windowMs: number }
): Promise<{ success: true; remaining: number; resetTime: number } | NextResponse> {
  const identifier = getClientIdentifier(req);
  const { success, remaining, resetTime } = rateLimiter.check(
    identifier,
    config.limit,
    config.windowMs
  );

  if (!success) {
    // Log rate limit violation
    await logSecurityEvent({
      type: "rate_limit_exceeded",
      timestamp: Date.now(),
      metadata: {
        message: `Rate limit exceeded for ${req.nextUrl.pathname}`,
        ip: identifier,
        path: req.nextUrl.pathname,
        method: req.method,
        limit: config.limit,
        windowMs: config.windowMs,
      },
    });

    // Return 429 Too Many Requests
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(resetTime).toISOString(),
        },
      }
    );
  }

  // Return success with rate limit info
  return { success: true, remaining, resetTime };
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number,
  resetTime: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(resetTime).toISOString());
  return response;
}

/**
 * Wrapper function to easily add rate limiting to API routes
 * 
 * @example
 * export async function POST(req: NextRequest) {
 *   return withRateLimit(req, RATE_LIMITS.CHECKOUT, async () => {
 *     // Your route handler logic here
 *     return NextResponse.json({ success: true });
 *   });
 * }
 */
export async function withRateLimit(
  req: NextRequest,
  config: { limit: number; windowMs: number },
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Check rate limit
  const rateLimitResult = await applyRateLimit(req, config);
  
  // If rate limited, return 429 response
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Execute handler
  const response = await handler();

  // Add rate limit headers to successful response
  return addRateLimitHeaders(
    response,
    rateLimitResult.remaining,
    config.limit,
    rateLimitResult.resetTime
  );
}
