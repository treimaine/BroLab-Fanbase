/**
 * Reserved slugs that cannot be used as artist slugs
 * These are system routes and reserved keywords
 */
export const RESERVED_SLUGS = [
  "me",
  "dashboard",
  "sign-in",
  "sign-up",
  "api",
  "admin",
  "settings",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "contact",
  "explore",
  "features",
  "pricing",
  "docs",
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as ReservedSlug);
}

/**
 * Blocked social/streaming platform domains for Custom Links
 * These platforms should be managed via Profile & Bio → Social Links
 * Requirements: R-CL-2
 */
export const BLOCKED_SOCIAL_DOMAINS = [
  "instagram.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "youtu.be",
  "spotify.com",
  "open.spotify.com",
  "tiktok.com",
  "soundcloud.com",
  "music.apple.com",
  "facebook.com",
  "twitch.tv",
] as const;

export type BlockedSocialDomain = (typeof BLOCKED_SOCIAL_DOMAINS)[number];

/**
 * Check if a URL points to a blocked social/streaming platform
 * Requirements: R-CL-2, R-CL-3
 * 
 * @param url - The URL to check
 * @returns true if the URL domain is blocked, false otherwise
 */
export function isSocialPlatformUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    
    return BLOCKED_SOCIAL_DOMAINS.some((domain) => {
      // Exact match or subdomain match
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    // Invalid URL, let other validation handle it
    return false;
  }
}

/**
 * Error message for blocked social platform URLs
 * Requirements: R-CL-3
 */
export const SOCIAL_PLATFORM_ERROR_MESSAGE = 
  "Manage social links in Profile & Bio → Social Links.";
