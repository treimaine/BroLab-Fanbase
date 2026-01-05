"use client";

/**
 * Global Player Store - Zustand
 * Requirements: 19.1 - Global Player (Audio) Core
 * 
 * State: currentTrack, status, currentTime, duration, volume, queue
 * Actions: loadAndPlay, togglePlayPause, seek, next/prev
 */

import type { PlayerState, PlayerStatus, PlayerStore, Track } from "@/types/player";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const initialState: PlayerState = {
  currentTrack: null,
  status: "idle",
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  error: null,
};

// Audio element reference (singleton, managed outside store for direct DOM access)
let audioElement: HTMLAudioElement | null = null;

export const getAudioElement = (): HTMLAudioElement | null => audioElement;

export const setAudioElement = (element: HTMLAudioElement | null) => {
  audioElement = element;
};

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Load and play a track
        loadAndPlay: (track: Track, url: string) => {
          const audio = getAudioElement();
          if (!audio) {
            set({ error: "Audio element not initialized", status: "error" });
            return;
          }

          set({
            currentTrack: track,
            status: "loading",
            currentTime: 0,
            duration: 0,
            error: null,
          });

          // Update queue if track is not already current
          const { queue } = get();
          const trackIndex = queue.findIndex((t) => t.id === track.id);
          
          if (trackIndex === -1) {
            // Add to queue and set as current
            set({
              queue: [...queue, track],
              queueIndex: queue.length,
            });
          } else {
            set({ queueIndex: trackIndex });
          }

          audio.src = url;
          audio.load();
          
          audio.play().catch((err) => {
            console.error("Playback failed:", err);
            set({ 
              status: "error", 
              error: err.message || "Failed to play audio" 
            });
          });
        },

        // Toggle play/pause
        togglePlayPause: () => {
          const audio = getAudioElement();
          const { status } = get();

          if (!audio?.src) return;

          if (status === "playing") {
            audio.pause();
          } else {
            audio.play().catch((err) => {
              set({ status: "error", error: err.message });
            });
          }
        },

        // Play
        play: () => {
          const audio = getAudioElement();
          if (!audio?.src) return;

          audio.play().catch((err) => {
            set({ status: "error", error: err.message });
          });
        },

        // Pause
        pause: () => {
          const audio = getAudioElement();
          if (audio) {
            audio.pause();
          }
        },

        // Stop playback and reset
        stop: () => {
          const audio = getAudioElement();
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
          set({
            status: "idle",
            currentTime: 0,
          });
        },

        // Seek to specific time
        seek: (time: number) => {
          const audio = getAudioElement();
          if (audio && !Number.isNaN(time) && Number.isFinite(time)) {
            audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
          }
        },

        // Update current time (called from audio events)
        setCurrentTime: (time: number) => {
          set({ currentTime: time });
        },

        // Update duration (called from audio events)
        setDuration: (duration: number) => {
          set({ duration });
        },

        // Set volume (0-1)
        setVolume: (volume: number) => {
          const audio = getAudioElement();
          const clampedVolume = Math.max(0, Math.min(1, volume));
          
          if (audio) {
            audio.volume = clampedVolume;
          }
          set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
        },

        // Toggle mute
        toggleMute: () => {
          const audio = getAudioElement();
          const { isMuted } = get();

          if (audio) {
            audio.muted = !isMuted;
          }
          set({ isMuted: !isMuted });
        },

        // Set queue
        setQueue: (tracks: Track[]) => {
          set({ queue: tracks, queueIndex: tracks.length > 0 ? 0 : -1 });
        },

        // Add track to queue
        addToQueue: (track: Track) => {
          const { queue } = get();
          set({ queue: [...queue, track] });
        },

        // Next track
        next: () => {
          const { queue, queueIndex } = get();
          if (queueIndex < queue.length - 1) {
            set({ queueIndex: queueIndex + 1 });
            // Note: Caller should fetch URL and call loadAndPlay for the next track
          }
        },

        // Previous track
        prev: () => {
          const { queueIndex, currentTime } = get();
          const audio = getAudioElement();

          // If more than 3 seconds in, restart current track
          if (currentTime > 3) {
            if (audio) {
              audio.currentTime = 0;
            }
            return;
          }

          // Otherwise go to previous track
          if (queueIndex > 0) {
            set({ queueIndex: queueIndex - 1 });
            // Note: Caller should fetch URL and call loadAndPlay for the previous track
          }
        },

        // Set status
        setStatus: (status: PlayerStatus) => {
          set({ status });
        },

        // Set error
        setError: (error: string | null) => {
          set({ error, status: error ? "error" : get().status });
        },

        // Reset to initial state
        reset: () => {
          const audio = getAudioElement();
          if (audio) {
            audio.pause();
            audio.src = "";
          }
          set(initialState);
        },
      }),
      {
        name: "brolab-player-storage",
        // Only persist volume preference, not playback state
        partialize: (state) => ({
          volume: state.volume,
          isMuted: state.isMuted,
        }),
      }
    ),
    { name: "PlayerStore" }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentTrack = () => usePlayerStore((state) => state.currentTrack);
export const usePlayerStatus = () => usePlayerStore((state) => state.status);
export const usePlaybackProgress = () => usePlayerStore((state) => ({
  currentTime: state.currentTime,
  duration: state.duration,
}));
export const usePlayerVolume = () => usePlayerStore((state) => ({
  volume: state.volume,
  isMuted: state.isMuted,
}));
export const usePlayerQueue = () => usePlayerStore((state) => ({
  queue: state.queue,
  queueIndex: state.queueIndex,
}));
export const useIsPlaying = () => usePlayerStore((state) => state.status === "playing");
