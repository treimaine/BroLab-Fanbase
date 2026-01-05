"use client";

/**
 * VideoModal - Lightweight video viewer modal
 * Requirements: 19.4 - Video Playback (MVP)
 * 
 * - Open on video items, <video controls>
 * - Rule: pause global audio on open
 * - Support play/pause and seek
 */

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VideoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly videoUrl: string;
  readonly title?: string;
  readonly posterUrl?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  posterUrl,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pause = usePlayerStore((state) => state.pause);
  const playerStatus = usePlayerStore((state) => state.status);

  // Pause global audio when video modal opens (Requirement 19.4)
  useEffect(() => {
    if (isOpen && playerStatus === "playing") {
      pause();
    }
  }, [isOpen, playerStatus, pause]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    // Reset video to beginning when it ends
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    // Pause video when closing
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  }, [onClose]);

  // Handle keyboard accessibility (space toggles play/pause)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " " && videoRef.current) {
      e.preventDefault();
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-full p-0 overflow-hidden",
          "bg-black border-none"
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white font-medium truncate pr-8">
              {title || "Video"}
            </DialogTitle>
            <DialogClose asChild>
              <button
                onClick={handleClose}
                className={cn(
                  "absolute right-4 top-4",
                  "w-8 h-8 rounded-full",
                  "bg-white/20 hover:bg-white/30",
                  "flex items-center justify-center",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-white"
                )}
                aria-label="Close video"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onEnded={handleVideoEnd}
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage video modal state
 */
export function useVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoData, setVideoData] = useState<{
    url: string;
    title?: string;
    posterUrl?: string;
  } | null>(null);

  const openVideo = useCallback((url: string, title?: string, posterUrl?: string) => {
    setVideoData({ url, title, posterUrl });
    setIsOpen(true);
  }, []);

  const closeVideo = useCallback(() => {
    setIsOpen(false);
    setVideoData(null);
  }, []);

  return {
    isOpen,
    videoData,
    openVideo,
    closeVideo,
  };
}