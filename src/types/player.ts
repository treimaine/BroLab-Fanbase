/**
 * Media Player Types for BroLab Fanbase
 * Requirements: 19.1 - Global Player (Audio) Core
 */

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistSlug?: string;
  coverImageUrl?: string;
  fileStorageId: string;
  type: "music" | "video";
  duration?: number;
  productId?: string; // For ownership verification when accessing private content
}

export interface PlayerState {
  // Current track info
  currentTrack: Track | null;
  status: PlayerStatus;
  
  // Playback state
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  
  // Queue (MVP: single track minimum, but API allows extension)
  queue: Track[];
  queueIndex: number;
  
  // Error state
  error: string | null;
}

export interface PlayerActions {
  // Core playback actions
  loadAndPlay: (track: Track, url: string) => void;
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  
  // Seek and progress
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  
  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Queue management
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  next: () => void;
  prev: () => void;
  
  // Status management
  setStatus: (status: PlayerStatus) => void;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;
