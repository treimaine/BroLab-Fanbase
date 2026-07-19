"use client";

/**
 * FeedCard - Post card for fan feed
 * Requirements: 9.3, 9.4 - Feed Card with action buttons and CTAs
 * Requirements: 19.1, 19.3 - Player integration
 * Requirements: R-FAN-LIKE-1, R-FAN-COMMENT-1 - Persistent likes + public comments
 *
 * - Artist avatar, name, timestamp, content, image
 * - Action buttons: like (persisted), comment (dialog), share
 * - CTA buttons: Listen (player), Get Tickets (ticketUrl), Shop Now (artist hub)
 */

import { api } from "@/../convex/_generated/api";
import { MediaCardOverlay } from "@/components/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { useMutation, useQuery } from "convex/react";
import { Heart, MapPin, MessageCircle, Music, Play, Share2, ShoppingBag, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CommentsDialog } from "./comments-dialog";

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
  // Social state (from Convex enrichment)
  targetType: "product" | "event";
  targetId: string;
  isLiked: boolean;
  // Event-specific CTA
  ticketUrl?: string;
  eventLocation?: string;
  // For music/video releases
  track?: Track;
  playableUrl?: string;
}

interface FeedCardProps {
  readonly post: FeedPost;
  readonly onRequestUrl?: (track: Track) => Promise<string | null>;
  readonly className?: string;
}

const typeConfig = {
  release: { label: "New Release", icon: Music, color: "bg-primary/10 text-primary" },
  event: { label: "Event", icon: Ticket, color: "bg-orange-500/10 text-orange-600" },
  merch: { label: "Merch", icon: ShoppingBag, color: "bg-green-500/10 text-green-600" },
  update: { label: "Update", icon: MessageCircle, color: "bg-blue-500/10 text-blue-600" },
};

export function FeedCard({ post, onRequestUrl, className }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const loadAndPlay = usePlayerStore((state) => state.loadAndPlay);
  const toggleLike = useMutation(api.likes.toggle);

  // Live comment count — falls back to the server-seeded value while loading
  const liveCommentCount = useQuery(api.comments.getCount, {
    targetType: post.targetType,
    targetId: post.targetId,
  });
  const commentsCount = liveCommentCount ?? post.comments;

  const config = typeConfig[post.type];
  const TypeIcon = config.icon;

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle like — optimistic UI, persisted server-side
  const handleLike = useCallback(async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    try {
      const result = await toggleLike({
        targetType: post.targetType,
        targetId: post.targetId,
      });
      // Reconcile with the authoritative count from the server
      setIsLiked(result.liked);
      setLikesCount(result.count);
    } catch (error) {
      // Revert on failure
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? prev - 1 : prev + 1));
      toast.error(error instanceof Error ? error.message : "Failed to update like");
    }
  }, [isLiked, toggleLike, post.targetType, post.targetId]);

  // Handle share — Web Share API with clipboard fallback
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${post.artist.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.artist.name, text: post.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled the share sheet — no-op
    }
  }, [post.artist.slug, post.artist.name, post.content]);

  // Handle Listen CTA - triggers loadAndPlay
  const handleListen = useCallback(async () => {
    if (!post.track) return;

    let url = post.playableUrl;
    if (!url && onRequestUrl) {
      url = (await onRequestUrl(post.track)) ?? undefined;
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
          <Button variant="default" size="sm" className="rounded-full gap-2" onClick={handleListen}>
            <Play className="w-4 h-4 fill-current" />
            Listen
          </Button>
        ) : null;
      case "event":
        return post.ticketUrl ? (
          <Button asChild variant="default" size="sm" className="rounded-full gap-2">
            <a href={post.ticketUrl} target="_blank" rel="noopener noreferrer">
              <Ticket className="w-4 h-4" />
              Get Tickets
            </a>
          </Button>
        ) : (
          <Button asChild variant="default" size="sm" className="rounded-full gap-2">
            <Link href={`/${post.artist.slug}`}>
              <Ticket className="w-4 h-4" />
              View Event
            </Link>
          </Button>
        );
      case "merch":
        return (
          <Button asChild variant="default" size="sm" className="rounded-full gap-2">
            <Link href={`/${post.artist.slug}`}>
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
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
          <Link href={`/${post.artist.slug}`} className="flex items-center gap-3 group">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.artist.avatarUrl} alt={post.artist.name} />
              <AvatarFallback>{post.artist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm group-hover:underline">{post.artist.name}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </Link>
          <Badge variant="secondary" className={cn("gap-1", config.color)}>
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground mb-3">{post.content}</p>

        {post.eventLocation && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {post.eventLocation}
          </p>
        )}

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
            aria-pressed={isLiked}
            aria-label="Like"
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setCommentsOpen(true)}
            aria-label="Comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{commentsCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* CTA button */}
        {renderCTA()}
      </CardFooter>

      <CommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        targetType={post.targetType}
        targetId={post.targetId}
        title={post.artist.name}
      />
    </Card>
  );
}
