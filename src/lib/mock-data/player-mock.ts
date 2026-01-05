/**
 * Mock data for player testing
 * Requirements: 19.1, 19.3 - Player integration testing
 * 
 * This file provides mock tracks and feed posts for development/testing.
 * In production, this data would come from Convex.
 */

import type { FeedPost } from "@/components/feed";
import type { Track } from "@/types/player";

// Sample audio URLs (public domain / royalty-free for testing)
// In production, these would be Convex storage URLs
const SAMPLE_AUDIO_URLS = {
  track1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  track2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  track3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
};

export const mockTracks: Track[] = [
  {
    id: "track-1",
    title: "Midnight Dreams",
    artistName: "Luna Nova",
    artistSlug: "luna-nova",
    coverImageUrl: "https://picsum.photos/seed/track1/400/400",
    fileStorageId: "mock-storage-1",
    type: "music",
    duration: 245,
  },
  {
    id: "track-2",
    title: "Electric Sunset",
    artistName: "The Neon Collective",
    artistSlug: "neon-collective",
    coverImageUrl: "https://picsum.photos/seed/track2/400/400",
    fileStorageId: "mock-storage-2",
    type: "music",
    duration: 198,
  },
  {
    id: "track-3",
    title: "Urban Echoes",
    artistName: "Metro Beats",
    artistSlug: "metro-beats",
    coverImageUrl: "https://picsum.photos/seed/track3/400/400",
    fileStorageId: "mock-storage-3",
    type: "music",
    duration: 312,
  },
];

export const mockFeedPosts: FeedPost[] = [
  {
    id: "post-1",
    artist: {
      name: "Luna Nova",
      avatarUrl: "https://picsum.photos/seed/luna/100/100",
      slug: "luna-nova",
    },
    content: "Just dropped my new single 'Midnight Dreams'! 🌙 This one's been in the works for months. Let me know what you think!",
    imageUrl: "https://picsum.photos/seed/track1/800/450",
    type: "release",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 234,
    comments: 45,
    track: mockTracks[0],
    playableUrl: SAMPLE_AUDIO_URLS.track1,
  },
  {
    id: "post-2",
    artist: {
      name: "The Neon Collective",
      avatarUrl: "https://picsum.photos/seed/neon/100/100",
      slug: "neon-collective",
    },
    content: "Tour dates announced! 🎤 Can't wait to see you all on the road this summer. Tickets on sale now!",
    imageUrl: "https://picsum.photos/seed/tour/800/450",
    type: "event",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes: 567,
    comments: 89,
  },
  {
    id: "post-3",
    artist: {
      name: "Metro Beats",
      avatarUrl: "https://picsum.photos/seed/metro/100/100",
      slug: "metro-beats",
    },
    content: "New merch drop! 🔥 Limited edition hoodies and tees available now. Link in bio!",
    imageUrl: "https://picsum.photos/seed/merch/800/450",
    type: "merch",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likes: 123,
    comments: 23,
  },
  {
    id: "post-4",
    artist: {
      name: "Luna Nova",
      avatarUrl: "https://picsum.photos/seed/luna/100/100",
      slug: "luna-nova",
    },
    content: "Studio session vibes ✨ Working on something special for you all...",
    imageUrl: "https://picsum.photos/seed/studio/800/450",
    type: "update",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    likes: 456,
    comments: 67,
  },
  {
    id: "post-5",
    artist: {
      name: "The Neon Collective",
      avatarUrl: "https://picsum.photos/seed/neon/100/100",
      slug: "neon-collective",
    },
    content: "'Electric Sunset' is finally here! 🌅 Stream it now on all platforms.",
    imageUrl: "https://picsum.photos/seed/track2/800/450",
    type: "release",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    likes: 789,
    comments: 134,
    track: mockTracks[1],
    playableUrl: SAMPLE_AUDIO_URLS.track2,
  },
];

/**
 * Mock function to simulate fetching a playable URL from Convex
 * In production, this would call the Convex files.getPlayableUrl function
 */
export async function getMockPlayableUrl(track: Track): Promise<string | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock URL based on track ID
  switch (track.id) {
    case "track-1":
      return SAMPLE_AUDIO_URLS.track1;
    case "track-2":
      return SAMPLE_AUDIO_URLS.track2;
    case "track-3":
      return SAMPLE_AUDIO_URLS.track3;
    default:
      return null;
  }
}
