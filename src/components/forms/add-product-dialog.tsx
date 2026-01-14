"use client";

/**
 * AddProductDialog Component
 * Requirements: 16.2, 16.3 - Create product with form validation and file upload
 *
 * Features:
 * - Title input field
 * - Description textarea
 * - Type selector (music/video)
 * - Price input field
 * - Visibility selector (public/private)
 * - Cover image URL input
 * - File upload input with client-side validation
 * - Progress indicator during upload
 * - Inline validation with FormMessage
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Music, Plus, Upload, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
    ALLOWED_AUDIO_TYPES,
    ALLOWED_VIDEO_TYPES,
    MAX_AUDIO_SIZE,
    MAX_VIDEO_SIZE,
    validateFileUpload,
    type FileType,
} from "@/lib/validations";

/**
 * Product form validation schema
 * Requirements: 16.2, 16.3 - Form validation for product fields
 */
const addProductFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  type: z.enum(["music", "video"], {
    message: "Please select a product type",
  }),
  priceUSD: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num >= 0;
      },
      { message: "Price must be a valid positive number" }
    ),
  visibility: z.enum(["public", "private"], {
    message: "Please select visibility",
  }),
  coverImageUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" }
    ),
});

type AddProductFormValues = z.infer<typeof addProductFormSchema>;

export interface AddProductData {
  title: string;
  description?: string;
  type: "music" | "video";
  priceUSD: number;
  visibility: "public" | "private";
  coverImageUrl?: string;
  file?: File;
}

interface AddProductDialogProps {
  readonly onAddProduct: (
    data: AddProductData,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  readonly trigger?: React.ReactNode;
  readonly disabled?: boolean;
}

/**
 * Get description text for product type
 */
function getTypeDescription(type: "music" | "video" | undefined): string {
  if (type === "music") {
    return "Supported: MP3, WAV (max 50MB)";
  }
  if (type === "video") {
    return "Supported: MP4 (max 200MB)";
  }
  return "Choose the type of content";
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get accepted file types based on product type
 */
function getAcceptedTypes(type: FileType): string {
  if (type === "music") {
    return ALLOWED_AUDIO_TYPES.join(",");
  }
  return ALLOWED_VIDEO_TYPES.join(",");
}

/**
 * Get max file size based on product type
 */
function getMaxSize(type: FileType): number {
  return type === "music" ? MAX_AUDIO_SIZE : MAX_VIDEO_SIZE;
}

export function AddProductDialog({
  onAddProduct,
  trigger,
  disabled = false,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: undefined,
      priceUSD: "",
      visibility: "public",
      coverImageUrl: "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const watchedType = form.watch("type");

  /**
   * Handle file selection with validation
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type is selected
    if (!watchedType) {
      setFileError("Please select a product type first");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file
    const validation = validateFileUpload(file, watchedType);
    if (!validation.valid) {
      setFileError(validation.error ?? "Invalid file");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
  }

  /**
   * Clear selected file
   */
  function clearFile() {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Handle form submission
   */
  async function onSubmit(data: AddProductFormValues) {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      await onAddProduct(
        {
          title: data.title,
          description: data.description?.trim() || undefined,
          type: data.type,
          priceUSD: Number.parseFloat(data.priceUSD),
          visibility: data.visibility,
          coverImageUrl: data.coverImageUrl?.trim() || undefined,
          file: selectedFile ?? undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Reset form and close dialog on success
      form.reset();
      setSelectedFile(null);
      setFileError(null);
      setUploadProgress(0);
      setOpen(false);
    } catch {
      // Error handling is done by the parent component
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Handle dialog open/close
   */
  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setSelectedFile(null);
      setFileError(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }

  const isProcessing = isSubmitting || isUploading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={disabled} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Upload music or video content for your fans to purchase.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My New Track"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>The name of your product</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell fans about this release..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear file when type changes
                      clearFile();
                    }}
                    defaultValue={field.value}
                    disabled={isProcessing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="music">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span>Music</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>Video</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {getTypeDescription(watchedType)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Field */}
            <FormField
              control={form.control}
              name="priceUSD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="9.99"
                        className="pl-7"
                        {...field}
                        disabled={isProcessing}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Set to 0 for free products
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility Selector */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isProcessing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Public products appear on your hub
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image URL Field */}
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/cover.jpg"
                      type="url"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    A cover image for your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Media File (Optional)</Label>
              <div className="space-y-2">
                {/* File Input */}
                {!selectedFile && (
                  <button
                    type="button"
                    className={`
                      relative flex w-full flex-col items-center justify-center gap-2 
                      rounded-lg border-2 border-dashed p-6 
                      transition-colors
                      ${
                        watchedType
                          ? "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                          : "border-muted-foreground/10 bg-muted/20 cursor-not-allowed"
                      }
                    `}
                    onClick={() => {
                      if (watchedType && fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={!watchedType || isProcessing}
                  >
                    <Upload
                      className={`h-8 w-8 ${watchedType ? "text-muted-foreground" : "text-muted-foreground/30"}`}
                    />
                    <p
                      className={`text-sm ${watchedType ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                    >
                      {watchedType
                        ? "Click to select a file"
                        : "Select a product type first"}
                    </p>
                    {watchedType && (
                      <p className="text-xs text-muted-foreground/70">
                        Max size: {formatFileSize(getMaxSize(watchedType))}
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={watchedType ? getAcceptedTypes(watchedType) : ""}
                      onChange={handleFileChange}
                      disabled={isProcessing || !watchedType}
                      className="hidden"
                    />
                  </button>
                )}

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {watchedType === "music" ? (
                        <Music className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      disabled={isProcessing}
                      className="h-8 w-8 shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                )}

                {/* File Error */}
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload the media file fans will receive after purchase
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isProcessing}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="rounded-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
