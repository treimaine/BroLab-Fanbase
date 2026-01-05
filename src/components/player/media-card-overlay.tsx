"use client";

/**
 * MediaCardOverlay - Reusable play/pause overlay for media cards
 * Requirements: 19.3 - UI Contracts (SuperDesign + Dribbble-inspired)
 * 
 * Reusable overlay component for:
 * - Public Hub drops list
 * - Feed cards media
 * - Products cards
 * 
 * Behavior: play/pause current track
 * Shows centered Play button overlay on hover (desktop) and on tap (mobile)
 * Toggles to Pause when the same media is currently playing
 */

import { useTrackPlayer } from "@/lib/hooks/use-track-player";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { Pause, Play } from "lucide-react";

interface MediaCardOverlayProps {
  readonly track: Track;
  readonly playableUrl?: string;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly showOnHover?: boolean;
  readonly children?: React.ReactNode;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function MediaCardOverlay({
  track,
  playableUrl,
  onRequestUrl,
  className,
  size = "md",
  showOnHover = true,
  children,
}: MediaCardOverlayProps) {
  const { isThisTrackPlaying, handlePlayPause } = useTrackPlayer({
    track,
    playableUrl,
    onRequestUrl,
  });

  return (
    <div className={cn("relative group", className)}>
      {children}
      
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-black/40 backdrop-blur-[2px]",
          "transition-opacity duration-200",
          showOnHover ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          // Always show if this track is playing
          isThisTrackPlaying && "opacity-100"
        )}
      >
        <button
          onClick={handlePlayPause}
          className={cn(
            "rounded-full",
            "bg-white/90 text-black",
            "flex items-center justify-center",
            "shadow-lg",
            "transition-all duration-200",
            "hover:scale-110 hover:bg-white",
            "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50",
            "active:scale-95",
            sizeClasses[size]
          )}
          aria-label={isThisTrackPlaying ? "Pause" : "Play"}
        >
          {isThisTrackPlaying ? (
            <Pause className={cn(iconSizeClasses[size], "fill-current")} />
          ) : (
            <Play className={cn(iconSizeClasses[size], "fill-current ml-0.5")} />
          )}
        </button>
      </div>

      {/* Playing indicator */}
      {isThisTrackPlaying && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-primary animate-pulse" style={{ height: "40%" }} />
              <span className="w-0.5 bg-primary animate-pulse" style={{ height: "80%", animationDelay: "0.1s" }} />
              <span className="w-0.5 bg-primary animate-pulse" style={{ height: "60%", animationDelay: "0.2s" }} />
              <span className="w-0.5 bg-primary animate-pulse" style={{ height: "100%", animationDelay: "0.3s" }} />
            </div>
            <span className="text-xs text-white font-medium">Playing</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Standalone play button for use outside of overlay context
 */
interface PlayButtonProps {
  readonly track: Track;
  readonly playableUrl?: string;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly variant?: "primary" | "secondary" | "ghost";
}

export function PlayButton({
  track,
  playableUrl,
  onRequestUrl,
  className,
  size = "md",
  variant = "primary",
}: PlayButtonProps) {
  const { isThisTrackPlaying, handlePlayPause } = useTrackPlayer({
    track,
    playableUrl,
    onRequestUrl,
  });

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "bg-transparent text-foreground hover:bg-accent",
  };

  return (
    <button
      onClick={handlePlayPause}
      className={cn(
        "rounded-full flex items-center justify-center",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "active:scale-95",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={isThisTrackPlaying ? "Pause" : "Play"}
    >
      {isThisTrackPlaying ? (
        <Pause className={cn(iconSizeClasses[size], "fill-current")} />
      ) : (
        <Play className={cn(iconSizeClasses[size], "fill-current ml-0.5")} />
      )}
    </button>
  );
}
