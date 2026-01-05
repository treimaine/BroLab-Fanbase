import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
