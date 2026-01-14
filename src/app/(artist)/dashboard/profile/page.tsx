"use client";

import { ProfileForm } from "@/components/forms/profile-form";
import { SocialLink, SocialLinksList } from "@/components/forms/social-links-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";

/**
 * Artist Profile Page
 * Requirements: 5.1-5.6
 *
 * - ProfileForm: Image URL, Display Name, Unique Slug, Bio
 * - SocialLinksList: Toggle switches for social platforms
 * - Save button connected to Convex artists.update
 * - Toast success with sonner
 */
export default function ProfilePage() {
  const artist = useQuery(api.artists.getCurrentArtist);
  const updateArtist = useMutation(api.artists.update);

  const isLoading = artist === undefined;

  // Local state for social links (managed separately from ProfileForm)
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [hasUnsavedSocials, setHasUnsavedSocials] = useState(false);

  // Initialize socials from artist data
  useEffect(() => {
    if (artist?.socials) {
      setSocials(artist.socials);
      setHasUnsavedSocials(false);
    }
  }, [artist?.socials]);

  /**
   * Handle social links change
   */
  const handleSocialsChange = useCallback((newSocials: SocialLink[]) => {
    setSocials(newSocials);
    setHasUnsavedSocials(true);
  }, []);

  /**
   * Save social links to Convex
   */
  const handleSaveSocials = async () => {
    if (!artist) {
      toast.error("Please complete your profile first");
      return;
    }

    setIsSavingSocials(true);
    try {
      // Filter out empty URLs and only keep active links with valid URLs
      const validSocials = socials.filter(
        (s) => s.url.trim() !== "" || s.active
      );

      await updateArtist({
        artistId: artist._id,
        socials: validSocials,
      });

      toast.success("Social links updated successfully!");
      setHasUnsavedSocials(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save social links";
      toast.error(message);
    } finally {
      setIsSavingSocials(false);
    }
  };

  /**
   * Handle profile form success
   */
  const handleProfileSuccess = useCallback(() => {
    // Profile saved successfully - toast is handled by ProfileForm
  }, []);

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Profile & Bio
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your public profile information
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm
        artistId={artist?._id}
        initialData={
          artist
            ? {
                avatarUrl: artist.avatarUrl ?? "",
                displayName: artist.displayName,
                artistSlug: artist.artistSlug,
                bio: artist.bio ?? "",
              }
            : undefined
        }
        onSuccess={handleProfileSuccess}
      />

      {/* Social Links */}
      <div className="space-y-4">
        <SocialLinksList
          socials={socials}
          onChange={handleSocialsChange}
          disabled={!artist}
        />

        {/* Save Social Links Button */}
        {artist && (
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSocials}
              disabled={isSavingSocials || !hasUnsavedSocials}
              className="min-w-[160px] rounded-full"
            >
              {isSavingSocials ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Social Links
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* No artist profile notice */}
      {!artist && (
        <div className="rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> Complete the profile form above to create your
          artist profile. Once created, you can add social links.
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for profile page
 */
function ProfilePageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Profile form skeleton */}
      <div className="rounded-2xl border border-border/50 p-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Social links skeleton */}
      <div className="rounded-2xl border border-border/50 p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
