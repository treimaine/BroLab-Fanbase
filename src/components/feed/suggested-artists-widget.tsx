"use client";

/**
 * SuggestedArtistsWidget - Fan dashboard sidebar widget
 * Requirements: 9.5 - Display "Suggested Artists" recommendations
 * 
 * Shows a list of artists that the fan is not currently following.
 * For MVP, displays a simple list with follow buttons.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface SuggestedArtist {
  _id: string;
  artistSlug: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

interface SuggestedArtistsWidgetProps {
  artists: SuggestedArtist[];
  onFollowArtist?: (artistId: string) => void;
  className?: string;
}

/**
 * Get initials from display name for avatar fallback
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SuggestedArtistsWidget({
  artists,
  onFollowArtist,
  className,
}: Readonly<SuggestedArtistsWidgetProps>) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Suggested Artists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {artists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions available
          </p>
        ) : (
          artists.map((artist) => (
            <div
              key={artist._id}
              className="flex items-center gap-3 group"
            >
              {/* Artist Avatar */}
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage
                  src={artist.avatarUrl}
                  alt={artist.displayName}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(artist.displayName)}
                </AvatarFallback>
              </Avatar>

              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {artist.displayName}
                </p>
                {artist.bio && (
                  <p className="text-xs text-muted-foreground truncate">
                    {artist.bio}
                  </p>
                )}
              </div>

              {/* Follow Button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onFollowArtist?.(artist._id)}
                aria-label={`Follow ${artist.displayName}`}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
