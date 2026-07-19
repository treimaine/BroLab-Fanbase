"use client";

/**
 * Profile Content Component
 *
 * Thin wrapper around ProfileForm. Profile fields, images and social links are
 * all edited and saved together by a single "Save Profile" button inside
 * ProfileForm.
 *
 * Cognitive Complexity Target: < 10
 */

import type { Id } from "@/../convex/_generated/dataModel";
import { ProfileForm } from "@/components/forms/profile-form";
import { SocialLink } from "@/components/forms/social-links-list";
import { useCallback } from "react";

interface ProfileContentProps {
  readonly artist: {
    _id: Id<"artists">;
    displayName: string;
    artistSlug: string;
    avatarUrl?: string;
    avatarStorageId?: Id<"_storage">;
    coverUrl?: string;
    coverStorageId?: Id<"_storage">;
    bio?: string;
    socials?: SocialLink[];
  } | null;
}

export function ProfileContent({ artist }: Readonly<ProfileContentProps>) {
  const handleProfileSuccess = useCallback(() => {
    // Profile saved successfully - toast is handled by ProfileForm
  }, []);

  return (
    <>
      {/* Profile Form (includes social links + single save button) */}
      <ProfileForm
        artistId={artist?._id}
        initialData={
          artist
            ? {
                avatarUrl: artist.avatarUrl ?? "",
                avatarStorageId: artist.avatarStorageId,
                coverUrl: artist.coverUrl ?? "",
                coverStorageId: artist.coverStorageId,
                displayName: artist.displayName,
                artistSlug: artist.artistSlug,
                bio: artist.bio ?? "",
                socials: artist.socials ?? [],
              }
            : undefined
        }
        onSuccess={handleProfileSuccess}
      />

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
