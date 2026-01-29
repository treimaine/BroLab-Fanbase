"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Music, Users } from "lucide-react";
import Link from "next/link";

interface ArtistCardProps {
  readonly artistSlug: string;
  readonly displayName: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
  readonly followerCount: number;
}

/**
 * Artist Card Component
 * Used in the Explore page to display artist preview
 */
export function ArtistCard({
  artistSlug,
  displayName,
  bio,
  avatarUrl,
  followerCount,
}: ArtistCardProps) {
  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border",
          "bg-card/50 backdrop-blur-xl transition-all duration-300",
          "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
          "cursor-pointer"
        )}
      >
        <Link href={`/${artistSlug}`} className="block">
          {/* Avatar Section */}
          <div className="flex flex-col items-center p-6 pb-4">
            <Avatar className="h-24 w-24 border-2 border-border transition-all duration-300 group-hover:border-primary/30">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Artist Name */}
            <h3 className="mt-4 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
              {displayName}
            </h3>

            {/* Follower Count */}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {followerCount === 0 && "No followers yet"}
                {followerCount === 1 && "1 follower"}
                {followerCount > 1 && `${followerCount.toLocaleString()} followers`}
              </span>
            </div>
          </div>

          {/* Bio Section */}
          {bio && (
            <div className="border-t border-border/50 px-6 py-4">
              <p className="line-clamp-2 text-center text-sm text-muted-foreground">
                {bio}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="border-t border-border/50 p-4">
            <Button
              variant="outline"
              className={cn(
                "w-full rounded-xl border-primary/20 bg-primary/5",
                "text-primary transition-all duration-300",
                "group-hover:bg-primary group-hover:text-primary-foreground"
              )}
            >
              <Music className="mr-2 h-4 w-4" />
              View Hub
            </Button>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
