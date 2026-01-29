"use client";

/**
 * Profile Content Component
 * 
 * Extracted from ProfilePage to reduce cognitive complexity.
 * Handles profile form and social links management.
 * 
 * Cognitive Complexity Target: < 10
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { ProfileForm } from "@/components/forms/profile-form";
import { SocialLink, SocialLinksList } from "@/components/forms/social-links-list";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileContentProps {
  artist: {
    _id: Id<"artists">;
    displayName: string;
    artistSlug: string;
    avatarUrl?: string;
    bio?: string;
    socials?: SocialLink[];
  } | null;
}

export function ProfileContent({ artist }: ProfileContentProps) {
  const updateArtist = useMutation(api.artists.update);

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

  const handleSocialsChange = useCallback((newSocials: SocialLink[]) => {
    setSocials(newSocials);
    setHasUnsavedSocials(true);
  }, []);

  const handleSaveSocials = async () => {
    if (!artist) {
      toast.error("Please complete your profile first");
      return;
    }

    setIsSavingSocials(true);
    try {
      const validSocials = socials.filter((s) => s.url.trim() !== "" || s.active);

      await updateArtist({
        artistId: artist._id,
        socials: validSocials,
      });

      toast.success("Social links updated successfully!");
      setHasUnsavedSocials(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save social links";
      toast.error(message);
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleProfileSuccess = useCallback(() => {
    // Profile saved successfully - toast is handled by ProfileForm
  }, []);

  return (
    <>
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
        <SocialLinksList socials={socials} onChange={handleSocialsChange} disabled={!artist} />

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
          <strong>Note:</strong> Complete the profile form above to create your artist profile. Once
          created, you can add social links.
        </div>
      )}
    </>
  );
}
