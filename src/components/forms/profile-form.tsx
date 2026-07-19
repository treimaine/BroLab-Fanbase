"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ImageIcon, Loader2, Trash2, Upload, User, XCircle } from "lucide-react";
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
import { slugSchema } from "@/lib/validations";
import { getInitials } from "@/lib/utils";
import { SocialLink, SocialLinksList } from "@/components/forms/social-links-list";
import { AvatarCropper } from "@/components/forms/avatar-cropper";

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
  artistSlug: slugSchema,
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
    readonly coverUrl?: string;
    readonly coverStorageId?: Id<"_storage">;
    readonly displayName: string;
    readonly artistSlug: string;
    readonly bio?: string;
    readonly socials?: SocialLink[];
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
  // Resolved public URL for the avatar (persisted so the public hub can display it)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.avatarUrl);
  const [coverError, setCoverError] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverStorageId, setCoverStorageId] = useState<Id<"_storage"> | undefined>(
    initialData?.coverStorageId
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(
    initialData?.coverUrl
  );
  // Resolved public URL for the cover (persisted so the public hub can display it)
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialData?.coverUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  // Track the last blob: preview URLs so we can revoke them (avoid memory leaks)
  const avatarObjectUrlRef = useRef<string | undefined>(undefined);
  const coverObjectUrlRef = useRef<string | undefined>(undefined);

  // Social links are edited within this form so a single "Save Profile" persists
  // everything at once (no separate save button to forget).
  const [socials, setSocials] = useState<SocialLink[]>(initialData?.socials ?? []);

  // Avatar cropping + removal state
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  // When true, the current avatar should be removed on save
  const [clearAvatar, setClearAvatar] = useState(false);

  const createArtist = useMutation(api.artists.create);
  const updateArtist = useMutation(api.artists.update);
  const generateImageUploadUrl = useMutation(api.files.generateImageUploadUrl);
  
  // Get the URL for the stored avatar
  const storedAvatarUrl = useQuery(
    api.files.getImageUrl,
    avatarStorageId ? { storageId: avatarStorageId } : "skip"
  );

  // Get the URL for the stored cover image
  const storedCoverUrl = useQuery(
    api.files.getImageUrl,
    coverStorageId ? { storageId: coverStorageId } : "skip"
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
  const watchedDisplayName = form.watch("displayName");

  // Keep local socials in sync when the artist data (re)loads
  useEffect(() => {
    if (initialData?.socials) {
      setSocials(initialData.socials);
    }
  }, [initialData?.socials]);

  // Update avatar preview + persistable URL when stored URL is available.
  // The resolved URL replaces the temporary blob: preview, so revoke that blob.
  useEffect(() => {
    if (storedAvatarUrl) {
      setAvatarPreviewUrl(storedAvatarUrl);
      setAvatarUrl(storedAvatarUrl);
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = undefined;
      }
    }
  }, [storedAvatarUrl]);

  // Update cover preview + persistable URL when stored URL is available
  useEffect(() => {
    if (storedCoverUrl) {
      setCoverPreviewUrl(storedCoverUrl);
      setCoverUrl(storedCoverUrl);
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
        coverObjectUrlRef.current = undefined;
      }
    }
  }, [storedCoverUrl]);

  // Revoke any outstanding blob: preview URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
      if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    };
  }, []);

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

      // Create a local preview URL, revoking any previous blob first
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      avatarObjectUrlRef.current = previewUrl;
      setAvatarPreviewUrl(previewUrl);
      // A fresh avatar cancels any pending removal
      setClearAvatar(false);

      toast.success("Image uploaded successfully");
    } catch (error) {
      
      toast.error("Failed to upload image. Please try again.");
      setAvatarError(true);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [generateImageUploadUrl]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type/size early, then open the cropper before uploading
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      } else if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size must be less than 5MB");
      } else {
        setCropFile(file);
        setIsCropOpen(true);
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCropComplete = useCallback((cropped: File) => {
    handleAvatarUpload(cropped);
  }, [handleAvatarUpload]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = undefined;
    }
    setAvatarPreviewUrl(undefined);
    setAvatarUrl(undefined);
    setAvatarStorageId(undefined);
    setAvatarError(false);
    // Mark for server-side removal on save
    setClearAvatar(true);
  }, []);

  const handleCoverUpload = useCallback(async (file: File) => {
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

    setIsUploadingCover(true);
    setCoverError(false);

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
      // Setting the storage id triggers getImageUrl, which populates the
      // persistable coverUrl via the effect above.
      setCoverStorageId(storageId as Id<"_storage">);

      // Immediate local preview while the resolved URL loads, revoking any
      // previous blob first
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      coverObjectUrlRef.current = previewUrl;
      setCoverPreviewUrl(previewUrl);

      toast.success("Cover image uploaded successfully");
    } catch (error) {

      toast.error("Failed to upload cover image. Please try again.");
      setCoverError(true);
    } finally {
      setIsUploadingCover(false);
    }
  }, [generateImageUploadUrl]);

  const handleCoverFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
    // Reset input so same file can be selected again
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
  }, [handleCoverUpload]);

  const handleCoverClick = useCallback(() => {
    coverFileInputRef.current?.click();
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Keep only meaningful socials (has a URL or is toggled on)
      const validSocials = socials.filter((s) => s.url.trim() !== "" || s.active);

      if (artistId) {
        await updateArtist({
          artistId,
          artistSlug: data.artistSlug,
          displayName: data.displayName,
          bio: data.bio || undefined,
          avatarStorageId: avatarStorageId,
          // Persist the resolved public URL so the public hub can render it
          avatarUrl: avatarUrl,
          coverStorageId: coverStorageId,
          // Persist the resolved public URL so the public hub can render it
          coverUrl: coverUrl,
          socials: validSocials,
          clearAvatar: clearAvatar || undefined,
        });
        setClearAvatar(false);
        toast.success("Profile updated successfully!");
      } else {
        await createArtist({
          artistSlug: data.artistSlug,
          displayName: data.displayName,
          bio: data.bio || undefined,
          avatarUrl: avatarUrl,
          coverUrl: coverUrl,
          socials: validSocials,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
            {/* Cover Image Upload Field */}
            <div className="space-y-2">
              <label
                htmlFor="cover-upload"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Cover Image
              </label>
              <button
                type="button"
                onClick={handleCoverClick}
                disabled={isUploadingCover}
                className={cn(
                  "relative h-40 w-full overflow-hidden rounded-xl bg-muted",
                  "cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isUploadingCover && "opacity-50 cursor-not-allowed"
                )}
              >
                {coverPreviewUrl && !coverError ? (
                  <Image
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    onError={() => setCoverError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 via-primary/10 to-accent">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      No cover image yet
                    </span>
                  </div>
                )}
                {/* Upload overlay */}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity",
                  "hover:opacity-100",
                  isUploadingCover && "opacity-100"
                )}>
                  {isUploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Upload className="h-6 w-6 text-white" />
                  )}
                </div>
              </button>
              <input
                id="cover-upload"
                ref={coverFileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleCoverFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.8rem] text-muted-foreground">
                  Banner shown at the top of your public hub. JPEG, PNG, WebP or GIF. Max 5MB.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCoverClick}
                  disabled={isUploadingCover}
                  className="w-fit shrink-0"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Cover
                    </>
                  )}
                </Button>
              </div>
            </div>

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
                  <div className="flex flex-wrap gap-2">
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
                          {avatarPreviewUrl && !avatarError ? "Change Photo" : "Upload Image"}
                        </>
                      )}
                    </Button>
                    {avatarPreviewUrl && !avatarError && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="w-fit text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Square image recommended, at least 400×400px. JPEG, PNG, WebP or GIF, max 5MB.
                  </p>
                </div>

                {/* Live preview of how the avatar appears on the public hub */}
                <div className="ml-auto hidden shrink-0 flex-col items-center gap-1 sm:flex">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg">
                    {avatarPreviewUrl && !avatarError ? (
                      <Image
                        src={avatarPreviewUrl}
                        alt="Hub preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-semibold text-primary">
                        {getInitials(watchedDisplayName || initialData?.displayName || "?")}
                      </div>
                    )}
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground">Hub preview</span>
                </div>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Click the avatar or button to upload — you can reposition and zoom before saving.
              </p>

              <AvatarCropper
                file={cropFile}
                open={isCropOpen}
                onOpenChange={setIsCropOpen}
                onCropComplete={handleCropComplete}
              />
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
            </div>
          </CardContent>
        </Card>

        {/* Social Links (saved together with the profile) */}
        <SocialLinksList socials={socials} onChange={setSocials} />

        {/* Submit Button — persists profile fields, images and socials at once */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid || isUploadingAvatar || isUploadingCover}
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
  );
}
