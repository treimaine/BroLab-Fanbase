import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a string to a URL-friendly slug
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents/diacritics
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    // Replace spaces and underscores with hyphens
    .replaceAll(/[\s_]+/g, "-")
    // Remove all non-alphanumeric characters except hyphens
    .replaceAll(/[^a-z0-9-]/g, "")
    // Remove consecutive hyphens
    .replaceAll(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replaceAll(/^-+/g, "")
    .replaceAll(/-+$/g, "")
}

/**
 * Format currency amount in cents to USD string
 * @param cents - Amount in cents (e.g., 1234 = $12.34)
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Derive up-to-2 uppercase initials from a display name, used as the avatar
 * fallback across the app so the same name always yields the same initials.
 * @param name - Display name (e.g., "Steve Lemba")
 * @returns Initials (e.g., "SL"); "?" when the name is empty
 */
export function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "?";
}
