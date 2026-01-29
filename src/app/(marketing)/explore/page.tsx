"use client";

/**
 * Explore Artists Page
 * Public page for discovering artists on the platform
 * 
 * Features:
 * - Grid of artist cards
 * - Sorted by popularity (follower count)
 * - Responsive layout (2 cols mobile, 3-4 cols desktop)
 * - Empty state for no artists
 */

import { api } from "@/../convex/_generated/api";
import { ArtistCard } from "@/components/marketing/artist-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Music, Sparkles } from "lucide-react";

/**
 * Loading skeleton for artist cards
 */
function ArtistCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl">
      <div className="flex flex-col items-center p-6 pb-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="mt-4 h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>
      <div className="border-t border-border/50 px-6 py-4">
        <Skeleton className="mx-auto h-4 w-full" />
        <Skeleton className="mx-auto mt-2 h-4 w-3/4" />
      </div>
      <div className="border-t border-border/50 p-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Empty state when no artists exist
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Music className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground">
        No Artists Yet
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Be the first to join BroLab Fanbase and start building your community.
      </p>
    </motion.div>
  );
}

/**
 * Explore Artists Page Component
 */
export default function ExplorePage() {
  // Fetch all public artists
  const artists = useQuery(api.artists.getAllPublic);

  // Loading state
  const isLoading = artists === undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background py-16 transition-colors duration-300 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Discover Artists
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Explore <span className="italic text-primary">Artists</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Discover talented artists building their communities on BroLab Fanbase.
              Support them directly and get exclusive access to their work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Artists Grid Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading && (
            // Loading skeleton grid
            <div
              className={cn(
                "grid gap-6",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ArtistCardSkeleton key={`skeleton-${String(i)}`} />
              ))}
            </div>
          )}

          {!isLoading && artists && artists.length > 0 && (
            // Artists grid
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className={cn(
                "grid gap-6",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}
            >
              {artists.map((artist) => (
                <ArtistCard
                  key={artist._id}
                  artistSlug={artist.artistSlug}
                  displayName={artist.displayName}
                  bio={artist.bio}
                  avatarUrl={artist.avatarUrl}
                  followerCount={artist.followerCount}
                />
              ))}
            </motion.div>
          )}

          {!isLoading && (!artists || artists.length === 0) && (
            // Empty state
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
}
