"use client";

/**
 * useTrackPlayer - Custom hook for track playback logic
 * Eliminates code duplication across player components
 */

import {
    useCurrentTrack,
    useIsPlaying,
    usePlayerStore,
} from "@/lib/stores/player-store";
import type { Track } from "@/types/player";
import { useCallback } from "react";

interface UseTrackPlayerOptions {
  track: Track;
  playableUrl?: string;
  onRequestUrl?: (track: Track) => Promise<string | null>;
}

export function useTrackPlayer({
  track,
  playableUrl,
  onRequestUrl,
}: UseTrackPlayerOptions) {
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const loadAndPlay = usePlayerStore((state) => state.loadAndPlay);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  // Check if this track is the currently playing track
  const isCurrentTrack = currentTrack?.id === track.id;
  const isThisTrackPlaying = isCurrentTrack && isPlaying;

  // Handle play/pause - shared logic
  const handlePlayPause = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isCurrentTrack) {
        // Toggle play/pause for current track
        togglePlayPause();
      } else {
        // Load and play this track
        let url = playableUrl;

        if (!url && onRequestUrl) {
          url = (await onRequestUrl(track)) ?? undefined;
        }

        if (url) {
          loadAndPlay(track, url);
        }
      }
    },
    [isCurrentTrack, togglePlayPause, playableUrl, onRequestUrl, track, loadAndPlay]
  );

  return {
    isCurrentTrack,
    isThisTrackPlaying,
    handlePlayPause,
  };
}
