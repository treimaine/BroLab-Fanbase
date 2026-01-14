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

  /**
   * Reset the upload state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  /**
   * Upload a file to Convex storage
   */
  const uploadFile = useCallback(
    async (file: File, type: FileType): Promise<UploadResult | null> => {
      // Reset state
      setError(null);
      setProgress(0);

      // Validate file before upload
      const validation = validateFileUpload(file, type);
      if (!validation.valid) {
        const errorMsg = validation.error ?? "Invalid file";
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return null;
      }

      setIsUploading(true);

      try {
        // Step 1: Request upload URL from Convex (10% progress)
        setProgress(10);
        onProgress?.(10);

        const uploadUrl = await generateUploadUrl();

        // Step 2: Upload file to URL
        setProgress(20);
        onProgress?.(20);

        const response = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              // Map upload progress from 20% to 90%
              const uploadPercent = (event.loaded / event.total) * 70 + 20;
              setProgress(uploadPercent);
              onProgress?.(uploadPercent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(
                new Response(xhr.responseText, {
                  status: xhr.status,
                  statusText: xhr.statusText,
                })
              );
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload was aborted"));
          });

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Step 3: Parse response to get storageId
        setProgress(95);
        onProgress?.(95);

        const result = await response.json();
        const storageId = result.storageId as Id<"_storage">;

        if (!storageId) {
          throw new Error("No storageId returned from upload");
        }

        // Complete
        setProgress(100);
        onProgress?.(100);

        if (showToasts) {
          toast.success("File uploaded successfully");
        }

        return {
          storageId,
          contentType: file.type,
          fileSize: file.size,
        };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, onProgress, showToasts]
  );

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset,
  };
}
