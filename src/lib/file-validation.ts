/**
 * File Validation Utilities
 * Security: A06:2025 - Insecure Design mitigation
 * 
 * Provides client-side file validation including:
 * - MIME type validation
 * - File size validation
 * - SHA-256 checksum calculation
 */

/**
 * Calculate SHA-256 checksum of a file
 * Used for file integrity verification
 */
export async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Validate file type matches expected category
 */
export function validateFileType(
  file: File,
  expectedType: "audio" | "video" | "image"
): boolean {
  const mimeType = file.type.toLowerCase();

  switch (expectedType) {
    case "audio":
      return (
        mimeType.startsWith("audio/") ||
        mimeType === "application/ogg"
      );
    case "video":
      return (
        mimeType.startsWith("video/") ||
        mimeType === "application/x-mpegurl"
      );
    case "image":
      return (
        mimeType.startsWith("image/") &&
        (mimeType.includes("jpeg") ||
          mimeType.includes("jpg") ||
          mimeType.includes("png") ||
          mimeType.includes("webp") ||
          mimeType.includes("gif"))
      );
    default:
      return false;
  }
}

/**
 * Validate file size against limit
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Comprehensive file validation before upload
 */
export async function validateFileBeforeUpload(
  file: File,
  expectedType: "audio" | "video" | "image",
  maxSizeBytes: number
): Promise<{
  valid: boolean;
  error?: string;
  checksum?: string;
}> {
  // Validate file type
  if (!validateFileType(file, expectedType)) {
    return {
      valid: false,
      error: `Invalid file type. Expected ${expectedType}, got ${file.type}`,
    };
  }

  // Validate file size
  if (!validateFileSize(file, maxSizeBytes)) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(maxSizeBytes)})`,
    };
  }

  // Calculate checksum
  const checksum = await calculateFileChecksum(file);
  return {
    valid: true,
    checksum,
  };
}
