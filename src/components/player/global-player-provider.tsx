"use client";

/**
 * GlobalPlayerProvider - Audio element manager
 * Requirements: 19.1 - Global Player (Audio) Core
 * 
 * - Persists across route changes
 * - Manages the singleton audio element
 * - Wires up audio events to the store
 */

import {
    getAudioElement,
    setAudioElement,
    usePlayerStore
} from "@/lib/stores/player-store";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface GlobalPlayerProviderProps {
  readonly children: React.ReactNode;
}

export function GlobalPlayerProvider({ children }: GlobalPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get store actions
  const setStatus = usePlayerStore((state) => state.setStatus);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setError = usePlayerStore((state) => state.setError);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);

  // Handle audio errors gracefully (Requirement 19.6)
  const handleError = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    const error = audio.error;
    
    let errorMessage = "Failed to load audio";
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Playback aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Audio decoding error";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported";
          break;
      }
    }
    
    setError(errorMessage);
    setStatus("error");
    toast.error(errorMessage);
  }, [setError, setStatus]);

  // Initialize audio element on mount
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audioRef.current = audio;
      setAudioElement(audio);
    }

    const audio = audioRef.current;

    // Event handlers
    const handleLoadStart = () => setStatus("loading");
    const handleCanPlay = () => {
      const currentStatus = usePlayerStore.getState().status;
      if (currentStatus === "loading") {
        setStatus("playing");
      }
    };
    const handlePlay = () => setStatus("playing");
    const handlePause = () => setStatus("paused");
    const handleEnded = () => {
      setStatus("idle");
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleDurationChange = () => {
      if (!Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      // Duration is already handled by durationchange event
      handleDurationChange();
    };

    // Attach event listeners
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    // Set initial volume
    audio.volume = volume;
    audio.muted = isMuted;

    // Cleanup on unmount
    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
    };
  }, [setStatus, setCurrentTime, setDuration, handleError, volume, isMuted]);

  // Sync volume changes
  useEffect(() => {
    const audio = getAudioElement();
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  return <>{children}</>;
}
