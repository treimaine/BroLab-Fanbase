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
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as ReservedSlug);
}
