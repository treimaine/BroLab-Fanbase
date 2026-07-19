"use client";

/**
 * Fan "Following" Page
 * Requirements: R-FAN-FOLLOWING-1 - Manage followed artists from the dashboard
 *
 * Lists the artists the current fan follows, with a link to each artist hub and
 * an unfollow action. Uses the existing follows queries/mutations.
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function FollowingPage() {
  const artists = useQuery(api.follows.getFollowedArtists);
  const toggleFollow = useMutation(api.follows.toggle);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const handleUnfollow = useCallback(
    async (artistId: string, name: string) => {
      setPending((prev) => new Set(prev).add(artistId));
      try {
        await toggleFollow({ artistId: artistId as Id<"artists"> });
        toast.success(`Unfollowed ${name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to unfollow");
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(artistId);
          return next;
        });
      }
    },
    [toggleFollow]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Following</h1>
          <p className="text-sm text-muted-foreground">
            Artists you follow show up in your feed.
          </p>
        </div>

        {/* Loading */}
        {artists === undefined && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {artists && artists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">You&apos;re not following anyone yet</h2>
            <p className="text-muted-foreground max-w-md">
              Discover artists and follow them to build your personalized feed.
            </p>
          </div>
        )}

        {/* Following list */}
        {artists && artists.length > 0 && (
          <div className="space-y-3">
            {artists.map((artist) => (
              <Card key={artist._id} className="flex items-center gap-4 p-4">
                <Link href={`/${artist.artistSlug}`} className="shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={artist.avatarUrl} alt={artist.displayName} />
                    <AvatarFallback>{artist.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/${artist.artistSlug}`} className="font-semibold hover:underline">
                    {artist.displayName}
                  </Link>
                  {artist.bio && (
                    <p className="text-sm text-muted-foreground truncate">{artist.bio}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 shrink-0"
                  onClick={() => handleUnfollow(artist._id, artist.displayName)}
                  disabled={pending.has(artist._id)}
                >
                  <UserMinus className="w-4 h-4" />
                  Unfollow
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
