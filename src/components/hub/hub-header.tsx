"use client";

/**
 * HubHeader Component
 * Requirements: 3.2, 3.3, 3.4
 *
 * Displays the artist's public hub header with:
 * - Cover image with gradient overlay
 * - Centered avatar
 * - Artist name (serif typography) and bio
 * - Follow button (toggle) connected to Convex
 * - Social icons pills
 */

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
    Globe,
    Music2,
    type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Social platform configuration
 * Maps platform names to their icons
 * Using generic icons to avoid deprecated lucide-react social icons
 */
const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Globe,
  twitter: Globe,
  x: Globe,
  youtube: Globe,
  spotify: Music2,
  soundcloud: Music2,
  applemusic: Music2,
  website: Globe,
  facebook: Globe,
  twitch: Globe,
  tiktok: Music2,
};

/**
 * Get the icon component for a social platform
 */
function getSocialIcon(platform: string): LucideIcon {
  const normalizedPlatform = platform.toLowerCase().replaceAll(/\s+/g, "");
  return SOCIAL_ICONS[normalizedPlatform] ?? Globe;
}

/**
 * Get initials from a display name for avatar fallback
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the button text based on state
 */
function getFollowButtonText(isToggling: boolean, isFollowing: boolean | undefined): string {
  if (isToggling) {
    return "...";
  }
  if (isFollowing) {
    return "Following";
  }
  return "Follow";
}

interface Social {
  platform: string;
  url: string;
  active: boolean;
}

interface HubHeaderProps {
  readonly artistId: Id<"artists">;
  readonly displayName: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
  readonly coverUrl?: string;
  readonly socials: Social[];
}

export function HubHeader({
  artistId,
  displayName,
  bio,
  avatarUrl,
  coverUrl,
  socials,
}: HubHeaderProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  // Query follow status
  const isFollowing = useQuery(api.follows.isFollowing, { artistId });

  // Toggle follow mutation
  const toggleFollow = useMutation(api.follows.toggle);

  // Filter active socials only
  const activeSocials = socials.filter((social) => social.active);

  /**
   * Handle follow button click
   * Requirements: 3.5 - Toggle follow status when authenticated
   * Requirements: 3.6 - Redirect to sign-in when unauthenticated
   */
  const handleFollowClick = async () => {
    if (!isSignedIn) {
      // Redirect to sign-in if not authenticated
      router.push("/sign-in");
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleFollow({ artistId });
      toast.success(
        result.action === "followed"
          ? `You're now following ${displayName}`
          : `You unfollowed ${displayName}`
      );
    } catch (error) {
      toast.error("Failed to update follow status");
      console.error("Follow toggle error:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const buttonText = getFollowButtonText(isToggling, isFollowing);

  return (
    <div className="relative w-full">
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64 lg:h-72">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${displayName} cover`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/20 to-accent" />
        )}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="relative -mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20">
        {/* Centered Avatar */}
        <Avatar className="h-28 w-28 border-4 border-background shadow-lg sm:h-32 sm:w-32">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Artist Name (serif typography) */}
        <h1 className="mt-4 text-center font-serif text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          {displayName}
        </h1>

        {/* Bio */}
        {bio && (
          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground sm:text-base">
            {bio}
          </p>
        )}

        {/* Follow Button */}
        <Button
          onClick={handleFollowClick}
          disabled={isToggling}
          variant={isFollowing ? "outline" : "default"}
          className={cn(
            "mt-4 min-w-[120px] rounded-full px-6 transition-all",
            isFollowing && "border-primary/50 hover:border-primary"
          )}
        >
          {isToggling && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {buttonText}
        </Button>

        {/* Social Icons Pills */}
        {activeSocials.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {activeSocials.map((social) => {
              const Icon = getSocialIcon(social.platform);
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-secondary/80 text-secondary-foreground",
                    "transition-all hover:bg-primary hover:text-primary-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label={`Visit ${displayName} on ${social.platform}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
