"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Loader2, Upload, User, XCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { isReservedSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Profile form validation schema
 */
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  artistSlug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(30, "Slug must be less than 30 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use only lowercase letters, numbers, and hyphens (no consecutive hyphens)"
    )
    .refine((val) => !isReservedSlug(val), {
      message: "This slug is reserved and cannot be used",
    }),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  readonly artistId?: Id<"artists">;
  readonly initialData?: {
    readonly avatarUrl?: string;
    readonly avatarStorageId?: Id<"_storage">;
    readonly displayName: string;
    readonly artistSlug: string;
    readonly bio?: string;
  };
  readonly onSuccess?: () => void;
}

function SlugAvailabilityIcon({
  isChecking,
  availability,
}: {
  readonly isChecking: boolean;
  readonly availability: { available: boolean; reason: string | null } | null;
}) {
  if (isChecking) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
  if (availability?.available === true) {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  if (availability?.available === false) {
    return <XCircle className="h-4 w-4 text-destructive" />;
  }
  return null;
}

function getSlugErrorMessage(reason: string | null): string {
  if (reason === "Reserved slug") {
    return "This slug is reserved and cannot be used";
  }
  if (reason === "Slug already taken") {
    return "This slug is already taken";
  }
  return "Invalid slug format";
}

export function ProfileForm({
  artistId,
  initialData,
  onSuccess,
}: Readonly<ProfileFormProps>) {
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    available: boolean;
    reason: string | null;
  } | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarStorageId, setAvatarStorageId] = useState<Id<"_storage"> | undefined>(
    initialData?.avatarStorageId
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(
    initialData?.avatarUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createArtist = useMutation(api.artists.create);
  const updateArtist = useMutation(api.artists.update);
  const generateImageUploadUrl = useMutation(api.files.generateImageUploadUrl);
  
  // Get the URL for the stored avatar
  const storedAvatarUrl = useQuery(
    api.files.getImageUrl,
    avatarStorageId ? { storageId: avatarStorageId } : "skip"
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initialData?.displayName ?? "",
      artistSlug: initialData?.artistSlug ?? "",
      bio: initialData?.bio ?? "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;
  const watchedSlug = form.watch("artistSlug");

  // Update preview URL when stored URL is available
  useEffect(() => {
    if (storedAvatarUrl) {
      setAvatarPreviewUrl(storedAvatarUrl);
    }
  }, [storedAvatarUrl]);

  // Debounced slug availability check
  useEffect(() => {
    const slug = watchedSlug?.toLowerCase().trim();
    if (!slug || slug.length < 3) {
      setSlugAvailability(null);
      return;
    }
    if (initialData?.artistSlug && slug === initialData.artistSlug) {
      setSlugAvailability({ available: true, reason: null });
      return;
    }
    const formatRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!formatRegex.test(slug)) {
      setSlugAvailability({ available: false, reason: "Invalid format" });
      return;
    }
    if (isReservedSlug(slug)) {
      setSlugAvailability({ available: false, reason: "Reserved slug" });
      return;
    }
    setIsCheckingSlug(true);
    const timeoutId = setTimeout(() => {
      setSlugAvailability({ available: true, reason: null });
      setIsCheckingSlug(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedSlug, initialData?.artistSlug]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      return;
    }
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(false);

    try {
      // Generate upload URL
      const uploadUrl = await generateImageUploadUrl({ fileSize: file.size });

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      setAvatarStorageId(storageId as Id<"_storage">);
      
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreviewUrl(previewUrl);
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setAvatarError(true);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [generateImageUploadUrl]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleAvatarUpload]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (artistId) {
        await updateArtist({
          artistId,
          artistSlug: data.artistSlug,
          displayName: data.displayName,
          bio: data.bio || undefined,
          avatarStorageId: avatarStorageId,
          // Clear avatarUrl if using storage
          avatarUrl: avatarStorageId ? undefined : initialData?.avatarUrl,
        });
        toast.success("Profile updated successfully!");
      } else {
        await createArtist({
          artistSlug: data.artistSlug,
          displayName: data.displayName,
          bio: data.bio || undefined,
          avatarUrl: avatarPreviewUrl,
        });
        toast.success("Profile created successfully!");
      }
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    }
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="font-serif text-xl">
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload Field */}
            <div className="space-y-2">
              <label
                htmlFor="avatar-upload"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted",
                    "cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isUploadingAvatar && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {avatarPreviewUrl && !avatarError ? (
                    <Image
                      src={avatarPreviewUrl}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                      onError={() => setAvatarError(true)}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  {/* Upload overlay */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity",
                    "hover:opacity-100",
                    isUploadingAvatar && "opacity-100"
                  )}>
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <Upload className="h-6 w-6 text-white" />
                    )}
                  </div>
                </button>
                <input
                  id="avatar-upload"
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="w-fit"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP or GIF. Max 5MB.
                  </p>
                </div>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Click on the avatar or button to upload a new profile image
              </p>
            </div>

            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your artist name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is how fans will see your name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unique Slug Field with prefix */}
            <FormField
              control={form.control}
              name="artistSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        fan.brolab/
                      </span>
                      <Input
                        placeholder="your-slug"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            .toLowerCase()
                            .replaceAll(/[^a-z0-9-]/g, "");
                          field.onChange(value);
                        }}
                        className={cn(
                          "rounded-l-none",
                          slugAvailability?.available === false &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <div className="ml-2 flex h-9 w-9 items-center justify-center">
                        <SlugAvailabilityIcon
                          isChecking={isCheckingSlug}
                          availability={slugAvailability}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your unique URL for fans to find you. Use lowercase letters,
                    numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                  {slugAvailability?.available === false &&
                    slugAvailability.reason &&
                    !form.formState.errors.artistSlug && (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {getSlugErrorMessage(slugAvailability.reason)}
                      </p>
                    )}
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Tell fans about yourself..."
                      {...field}
                      rows={4}
                      className={cn(
                        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "resize-none"
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid || isUploadingAvatar}
                className="min-w-[120px] rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
