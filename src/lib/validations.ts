/**
 * File upload validation utilities
 */

// Allowed file types for upload
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4"] as const;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;

// Max file sizes in bytes
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export type FileType = "music" | "video" | "image";

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
  let allowedTypes: readonly string[];
  let maxSize: number;
  let allowedExtensions: string;

  switch (type) {
    case "music":
      allowedTypes = ALLOWED_AUDIO_TYPES;
      maxSize = MAX_AUDIO_SIZE;
      allowedExtensions = "MP3, WAV";
      break;
    case "video":
      allowedTypes = ALLOWED_VIDEO_TYPES;
      maxSize = MAX_VIDEO_SIZE;
      allowedExtensions = "MP4";
      break;
    case "image":
      allowedTypes = ALLOWED_IMAGE_TYPES;
      maxSize = MAX_IMAGE_SIZE;
      allowedExtensions = "JPEG, PNG, WebP";
      break;
  }

  // Check file type
  if (!allowedTypes.includes(file.type as any)) {
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
