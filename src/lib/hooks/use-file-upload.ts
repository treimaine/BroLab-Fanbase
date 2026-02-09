"use client";

/**
 * useFileUpload Hook
 * Requirements: 16.4, 16.5 - Convex File Storage upload flow
 *
 * Provides file upload functionality:
 * - Request upload URL from Convex
 * - Upload file to URL
 * - Return storageId on success
 * - Handle errors with toast
 */

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { isLimitError } from "../analytics";
import { handleMutationError } from "../limit-toast";
import { validateFileUpload, type FileType } from "../validations";

export interface UploadResult {
  storageId: Id<"_storage">;
  contentType: string;
  fileSize: number;
}

export interface UseFileUploadOptions {
  /** Callback for upload progress (0-100) */
  onProgress?: (progress: number) => void;
  /** Whether to show toast notifications */
  showToasts?: boolean;
}

export interface UseFileUploadReturn {
  /** Upload a file to Convex storage */
  uploadFile: (file: File, type: FileType) => Promise<UploadResult | null>;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Current upload progress (0-100) */
  progress: number;
  /** Last error message */
  error: string | null;
  /** Reset the upload state */
  reset: () => void;
}

// ============================================================================
// Helper Functions (extracted to reduce cognitive complexity)
// ============================================================================

/**
 * Create XHR upload promise with progress tracking
 */
function createXhrUpload(
  uploadUrl: string,
  file: File,
  onUploadProgress: (percent: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const uploadPercent = (event.loaded / event.total) * 70 + 20;
        onUploadProgress(uploadPercent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
        }));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload was aborted")));

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Handle upload error with appropriate toast
 * Requirements: R-ART-SUB-5.5, R-ART-SUB-5.6, R-ART-SUB-6.5
 */
function handleUploadError(err: unknown, showToasts: boolean): string {
  const errorMsg = err instanceof Error ? err.message : "Upload failed. Please try again.";
  
  if (!showToasts) {
    return errorMsg;
  }

  if (isLimitError(errorMsg)) {
    const limitType = errorMsg.toLowerCase().includes("video") ? "video" : "fileSize";
    handleMutationError(err, "Upload failed", limitType);
  } else {
    toast.error(errorMsg);
  }

  return errorMsg;
}

/**
 * Map FileType to Convex format
 */
function mapFileTypeToConvex(type: FileType): "audio" | "video" | "image" {
  if (type === "music") return "audio";
  if (type === "video") return "video";
  return "image";
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook for uploading files to Convex File Storage
 *
 * @example
 * ```tsx
 * const { uploadFile, isUploading, progress, error } = useFileUpload({
 *   onProgress: (p) => console.log(`Upload: ${p}%`),
 * });
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadFile(file, "music");
 *   if (result) {
 *     console.log("Uploaded:", result.storageId);
 *   }
 * };
 * ```
 */
export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const { onProgress, showToasts = true } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const generateImageUploadUrl = useMutation(api.files.generateImageUploadUrl);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
    onProgress?.(value);
  }, [onProgress]);

  const uploadFile = useCallback(
    async (file: File, type: FileType): Promise<UploadResult | null> => {
      setError(null);
      setProgress(0);

      // Validate file before upload
      const validation = validateFileUpload(file, type);
      if (!validation.valid) {
        const errorMsg = validation.error ?? "Invalid file";
        setError(errorMsg);
        if (showToasts) toast.error(errorMsg);
        return null;
      }

      setIsUploading(true);

      try {
        // Step 1: Request upload URL from Convex
        updateProgress(10);
        let uploadUrl: string;
        
        if (type === "image") {
          uploadUrl = await generateImageUploadUrl({
            fileSize: file.size,
          });
        } else {
          uploadUrl = await generateUploadUrl({
            fileType: mapFileTypeToConvex(type),
            fileSize: file.size,
          });
        }

        // Step 2: Upload file with progress tracking
        updateProgress(20);
        const response = await createXhrUpload(uploadUrl, file, updateProgress);

        // Step 3: Parse response
        updateProgress(95);
        const result = await response.json();
        const storageId = result.storageId as Id<"_storage">;

        if (!storageId) {
          throw new Error("No storageId returned from upload");
        }

        updateProgress(100);
        if (showToasts) toast.success("File uploaded successfully");

        return { storageId, contentType: file.type, fileSize: file.size };
      } catch (err) {
        setError(handleUploadError(err, showToasts));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, generateImageUploadUrl, updateProgress, showToasts]
  );

  return { uploadFile, isUploading, progress, error, reset };
}
