"use client";

/**
 * DropsList Component
 * Requirements: 3.4 - Display tabs for "Latest Drops" with clickable cards
 * 
 * Displays a list of artist's digital products (music/video) as clickable cards:
 * - Cover image with play overlay for media
 * - Title
 * - Type badge (music/video)
 * - Price in USD
 */

import { MediaCardOverlay } from "@/components/player";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { Music, Video } from "lucide-react";
import Image from "next/image";

/**
 * Drop interface representing a digital product
 * Based on the products table in Convex schema
 */
export interface Drop {
  id: string;
  title: string;
  type: "music" | "video";
  coverImageUrl?: string;
  priceUSD: number;
  visibility: "public" | "private";
  fileStorageId?: string;
  artistName?: string;
  artistSlug?: string;
  createdAt?: number;
}

interface DropsListProps {
  readonly drops: Drop[];
  readonly artistName: string;
  readonly artistSlug: string;
  readonly onDropClick?: (drop: Drop) => void;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
  readonly isLoading?: boolean;
  readonly className?: string;
}

/**
 * Type badge configuration
 */
const typeConfig = {
  music: {
    label: "Music",
    icon: Music,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  video: {
    label: "Video",
    icon: Video,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
};

/**
 * Format price in USD
 */
function formatPrice(priceUSD: number): string {
  if (priceUSD === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceUSD);
}

/**
 * Convert Drop to Track for player integration
 */
function dropToTrack(drop: Drop, artistName: string, artistSlug: string): Track {
  return {
    id: drop.id,
    title: drop.title,
    artistName: drop.artistName ?? artistName,
    artistSlug: drop.artistSlug ?? artistSlug,
    coverImageUrl: drop.coverImageUrl,
    fileStorageId: drop.fileStorageId ?? "",
    type: drop.type,
    productId: drop.id, // Include productId for ownership verification
  };
}

/**
 * Single drop card component
 */
function DropCard({
  drop,
  artistName,
  artistSlug,
  onClick,
  onRequestUrl,
}: {
  readonly drop: Drop;
  readonly artistName: string;
  readonly artistSlug: string;
  readonly onClick?: () => void;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
}) {
  const config = typeConfig[drop.type];
  const TypeIcon = config.icon;
  const track = dropToTrack(drop, artistName, artistSlug);
  const hasPlayableContent = Boolean(drop.fileStorageId);

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/50",
        "transition-all duration-200",
        "hover:shadow-lg hover:border-border",
        "cursor-pointer"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${drop.title} - ${config.label} - ${formatPrice(drop.priceUSD)}`}
    >
      {/* Cover Image with Play Overlay */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasPlayableContent ? (
          <MediaCardOverlay
            track={track}
            onRequestUrl={onRequestUrl}
            className="w-full h-full"
            size="lg"
          >
            {drop.coverImageUrl ? (
              <Image
                src={drop.coverImageUrl}
                alt={drop.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <TypeIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </MediaCardOverlay>
        ) : (
          <>
            {drop.coverImageUrl ? (
              <Image
                src={drop.coverImageUrl}
                alt={drop.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <TypeIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4">
        {/* Type Badge */}
        <Badge
          variant="outline"
          className={cn("mb-2 gap-1 text-xs", config.color)}
        >
          <TypeIcon className="w-3 h-3" />
          {config.label}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
          {drop.title}
        </h3>

        {/* Price */}
        <p className="text-sm font-medium text-primary">
          {formatPrice(drop.priceUSD)}
        </p>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for drop cards
 */
function DropCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </Card>
  );
}

/**
 * Empty state when no drops available
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Music className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No drops yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        This artist hasn&apos;t released any music or videos yet. Check back soon!
      </p>
    </div>
  );
}

/**
 * DropsList - Grid of clickable drop cards
 */
export function DropsList({
  drops,
  artistName,
  artistSlug,
  onDropClick,
  onRequestUrl,
  isLoading = false,
  className,
}: DropsListProps) {
  // Filter to only show public drops
  const publicDrops = drops.filter((drop) => drop.visibility === "public");

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <DropCardSkeleton key={`drop-skeleton-${String(i)}`} />
        ))}
      </div>
    );
  }

  if (publicDrops.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
        className
      )}
    >
      {publicDrops.map((drop) => (
        <DropCard
          key={drop.id}
          drop={drop}
          artistName={artistName}
          artistSlug={artistSlug}
          onClick={() => onDropClick?.(drop)}
          onRequestUrl={onRequestUrl}
        />
      ))}
    </div>
  );
}
