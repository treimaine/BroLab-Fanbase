/**
 * Rate Limiter Utility
 * 
 * Simple in-memory rate limiter using sliding window algorithm.
 * For production, consider using Upstash Redis for distributed rate limiting.
 * 
 * Security: A02:2025 - Security Misconfiguration
 * Prevents brute force attacks and DoS on API routes.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private readonly requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if a request should be rate limited
   * 
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.requests.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        success: true,
        remaining: limit - 1,
        resetTime,
      };
    }

    // Within window - check if limit exceeded
    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      success: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Cleanup and stop the interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("exit", () => rateLimiter.destroy());
}

export default rateLimiter;

/**
 * Rate limit configurations for different API routes
 */
export const RATE_LIMITS = {
  // Stripe checkout - 10 requests per 10 seconds per IP
  CHECKOUT: {
    limit: 10,
    windowMs: 10 * 1000,
  },
  // Onboarding set-role - 5 requests per minute per user
  ONBOARDING: {
    limit: 5,
    windowMs: 60 * 1000,
  },
  // Webhooks - 100 requests per minute per IP
  WEBHOOK: {
    limit: 100,
    windowMs: 60 * 1000,
  },
  // Default API rate limit - 60 requests per minute per IP
  DEFAULT: {
    limit: 60,
    windowMs: 60 * 1000,
  },
} as const;
