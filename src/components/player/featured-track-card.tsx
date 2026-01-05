"use client";

/**
 * FeaturedTrackCard - Featured track display with player controls
 * Requirements: 19.3 - UI Contracts (SuperDesign + Dribbble-inspired)
 * 
 * IMPORTANT: DO NOT RENAME THIS COMPONENT
 * 
 * - Must display: track title, artist, play/pause, progress indicator
 * - Must control the global player (not decorative only)
 * - UI: SuperDesign gradient card + progress + play/pause
 */

import { useTrackPlayer } from "@/lib/hooks/use-track-player";
import { usePlaybackProgress } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { Music, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface FeaturedTrackCardProps {
  readonly track: Track;
  readonly playableUrl?: string;
  readonly className?: string;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
}

export function FeaturedTrackCard({ 
  track, 
  playableUrl,
  className,
  onRequestUrl,
}: FeaturedTrackCardProps) {
  const { currentTime, duration } = usePlaybackProgress();
  const { isCurrentTrack, isThisTrackPlaying, handlePlayPause } = useTrackPlayer({
    track,
    playableUrl,
    onRequestUrl,
  });

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (!isCurrentTrack || duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [isCurrentTrack, currentTime, duration]);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (!seconds || !Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20",
        "border border-border/50",
        "p-4",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10",
        "group",
        className
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Cover Image / Placeholder */}
        <div className="relative flex-shrink-0">
          <div 
            className={cn(
              "w-16 h-16 rounded-xl overflow-hidden",
              "bg-gradient-to-br from-primary/30 to-accent/30",
              "flex items-center justify-center",
              "shadow-md"
            )}
          >
            {track.coverImageUrl ? (
              <Image 
                src={track.coverImageUrl} 
                alt={track.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <Music className="w-6 h-6 text-primary" />
            )}
          </div>
          
          {/* Play/Pause overlay button */}
          <button
            onClick={() => handlePlayPause()}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 rounded-xl",
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={isThisTrackPlaying ? "Pause" : "Play"}
          >
            {isThisTrackPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">
            {track.title}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {track.artistName}
          </p>
          
          {/* Progress bar (only show when this track is playing) */}
          {isCurrentTrack && (
            <div className="mt-2 space-y-1">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Play/Pause Button */}
        <button
          onClick={() => handlePlayPause()}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "shadow-lg shadow-primary/25",
            "transition-all duration-200",
            "hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "active:scale-95"
          )}
          aria-label={isThisTrackPlaying ? "Pause" : "Play"}
        >
          {isThisTrackPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
