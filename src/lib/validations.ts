/**
 * File upload validation utilities
 */

// Allowed file types for upload
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4"] as const;

// Max file sizes in bytes
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

export type FileType = "music" | "video";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file for upload based on type and size constraints
 */
export function validateFileUpload(
  file: File,
  type: FileType
): FileValidationResult {
  const allowedTypes: readonly string[] =
    type === "music" ? ALLOWED_AUDIO_TYPES : ALLOWED_VIDEO_TYPES;
  const maxSize = type === "music" ? MAX_AUDIO_SIZE : MAX_VIDEO_SIZE;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions =
      type === "music" ? "MP3, WAV" : "MP4";
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}
