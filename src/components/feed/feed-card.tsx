"use client";

/**
 * FeedCard - Post card for fan feed
 * Requirements: 9.3, 9.4 - Feed Card with action buttons and CTAs
 * Requirements: 19.1, 19.3 - Player integration
 * 
 * - Artist avatar, name, timestamp, content, image
 * - Action buttons (like, comment, share)
 * - CTA buttons (Listen, Get Tickets, Shop Now)
 * - "Listen" triggers loadAndPlay(track)
 */

import { MediaCardOverlay } from "@/components/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { Heart, MessageCircle, Music, Play, Share2, ShoppingBag, Ticket } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

export interface FeedPost {
  id: string;
  artist: {
    name: string;
    avatarUrl?: string;
    slug: string;
  };
  content: string;
  imageUrl?: string;
  type: "release" | "event" | "merch" | "update";
  createdAt: string;
  likes: number;
  comments: number;
  // For music/video releases
  track?: Track;
  playableUrl?: string;
}

interface FeedCardProps {
  readonly post: FeedPost;
  readonly onLike?: () => void;
  readonly onComment?: () => void;
  readonly onShare?: () => void;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
  readonly className?: string;
}

const typeConfig = {
  release: { label: "New Release", icon: Music, color: "bg-primary/10 text-primary" },
  event: { label: "Event", icon: Ticket, color: "bg-orange-500/10 text-orange-600" },
  merch: { label: "Merch", icon: ShoppingBag, color: "bg-green-500/10 text-green-600" },
  update: { label: "Update", icon: MessageCircle, color: "bg-blue-500/10 text-blue-600" },
};

export function FeedCard({
  post,
  onLike,
  onComment,
  onShare,
  onRequestUrl,
  className,
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const loadAndPlay = usePlayerStore((state) => state.loadAndPlay);

  const config = typeConfig[post.type];
  const TypeIcon = config.icon;

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle like
  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.();
  }, [isLiked, onLike]);

  // Handle Listen CTA - triggers loadAndPlay
  const handleListen = useCallback(async () => {
    if (!post.track) return;

    let url = post.playableUrl;
    if (!url && onRequestUrl) {
      url = await onRequestUrl(post.track) ?? undefined;
    }

    if (url) {
      loadAndPlay(post.track, url);
    }
  }, [post.track, post.playableUrl, onRequestUrl, loadAndPlay]);

  // Get CTA button based on post type
  const renderCTA = () => {
    switch (post.type) {
      case "release":
        return post.track ? (
          <Button
            variant="default"
            size="sm"
            className="rounded-full gap-2"
            onClick={handleListen}
          >
            <Play className="w-4 h-4 fill-current" />
            Listen
          </Button>
        ) : null;
      case "event":
        return (
          <Button variant="default" size="sm" className="rounded-full gap-2">
            <Ticket className="w-4 h-4" />
            Get Tickets
          </Button>
        );
      case "merch":
        return (
          <Button variant="default" size="sm" className="rounded-full gap-2">
            <ShoppingBag className="w-4 h-4" />
            Shop Now
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.artist.avatarUrl} alt={post.artist.name} />
              <AvatarFallback>{post.artist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.artist.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={cn("gap-1", config.color)}>
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground mb-3">{post.content}</p>

        {/* Media content */}
        {post.imageUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            {post.track ? (
              <MediaCardOverlay
                track={post.track}
                playableUrl={post.playableUrl}
                onRequestUrl={onRequestUrl}
                className="w-full h-full"
              >
                <Image
                  src={post.imageUrl}
                  alt={post.content}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </MediaCardOverlay>
            ) : (
              <Image
                src={post.imageUrl}
                alt={post.content}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-muted-foreground hover:text-foreground",
              isLiked && "text-red-500 hover:text-red-600"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onComment}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{post.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* CTA button */}
        {renderCTA()}
      </CardFooter>
    </Card>
  );
}
