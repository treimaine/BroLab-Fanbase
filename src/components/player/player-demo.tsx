"use client";

/**
 * PlayerDemo - Demo component for testing player functionality
 * Requirements: 19.1, 19.3 - Player integration testing
 * 
 * This component demonstrates:
 * - FeaturedTrackCard with player controls
 * - FeedCard with "Listen" CTA
 * - MediaCardOverlay hover play/pause
 */

import { FeedCard } from "@/components/feed";
import { FeaturedTrackCard, VideoModal, useVideoModal } from "@/components/player";
import { Button } from "@/components/ui/button";
import { getMockPlayableUrl, mockFeedPosts, mockTracks } from "@/lib/mock-data/player-mock";
import { Video } from "lucide-react";

export function PlayerDemo() {
  const { isOpen, videoData, openVideo, closeVideo } = useVideoModal();

  // Sample video URL for testing
  const handleOpenVideo = () => {
    openVideo(
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "Sample Video",
      "https://picsum.photos/seed/video/800/450"
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-4">Featured Track</h2>
        <FeaturedTrackCard
          track={mockTracks[0]}
          playableUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        />
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold mb-4">Video Player Test</h2>
        <Button onClick={handleOpenVideo} className="gap-2">
          <Video className="w-4 h-4" />
          Open Video Modal
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold mb-4">Feed</h2>
        <div className="space-y-4">
          {mockFeedPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onRequestUrl={getMockPlayableUrl}
              onLike={() => console.log("Liked:", post.id)}
              onComment={() => console.log("Comment:", post.id)}
              onShare={() => console.log("Share:", post.id)}
            />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {videoData && (
        <VideoModal
          isOpen={isOpen}
          onClose={closeVideo}
          videoUrl={videoData.url}
          title={videoData.title}
          posterUrl={videoData.posterUrl}
        />
      )}
    </div>
  );
}
