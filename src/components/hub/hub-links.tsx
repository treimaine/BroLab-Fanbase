"use client";

/**
 * HubLinks
 *
 * Renders the artist's active custom links on the public hub (classic
 * link-in-bio stack). Each click is recorded via a public mutation before the
 * link opens, so artists can see what fans actually click.
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { LINK_TYPES, type LinkType } from "@/components/dashboard/link-item";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";

interface HubLinksProps {
  readonly artistId: Id<"artists">;
}

// Social/streaming platforms live in the hub header (artist.socials), so keep
// them out of the custom-links stack — mirrors the dashboard Links filter.
const SOCIAL_LINK_TYPES = new Set(["instagram", "youtube", "spotify", "apple-music", "video"]);

function getLinkIcon(type: string) {
  const normalized = type.toLowerCase().replaceAll(/\s+/g, "-");
  return (LINK_TYPES[normalized as LinkType] ?? LINK_TYPES.other).icon;
}

export function HubLinks({ artistId }: HubLinksProps) {
  const activeLinks = useQuery(api.links.getActiveByArtist, { artistId });
  const recordClick = useMutation(api.links.recordClick);

  // Keep only genuine custom links (exclude legacy social-typed links)
  const links = (activeLinks ?? []).filter(
    (link) => !SOCIAL_LINK_TYPES.has(link.type.toLowerCase())
  );

  // Nothing to show (still loading or no custom links)
  if (!activeLinks || links.length === 0) {
    return null;
  }

  const handleClick = (linkId: string) => {
    // Fire-and-forget: don't block navigation on the write
    recordClick({ linkId: linkId as Id<"links"> }).catch(() => {});
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 px-4">
      {links.map((link) => {
        const Icon = getLinkIcon(link.type);
        return (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(link._id)}
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5",
              "shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-center text-sm font-medium">
              {link.title}
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </a>
        );
      })}
    </div>
  );
}
