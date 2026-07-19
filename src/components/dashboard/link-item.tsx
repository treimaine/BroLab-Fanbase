"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
    Calendar,
    ExternalLink,
    FileText,
    Globe,
    GripVertical,
    Heart,
    Mail,
    MousePointerClick,
    Music,
    ShoppingBag,
    Ticket,
    type LucideIcon,
} from "lucide-react";

/**
 * Link types with their display metadata
 * Business links only - social media managed via Profile & Bio → Social Links
 */
export const LINK_TYPES = {
  "latest-release": {
    label: "Latest Release",
    icon: Music,
    badgeVariant: "default" as const,
  },
  merch: {
    label: "Merch",
    icon: ShoppingBag,
    badgeVariant: "outline" as const,
  },
  tickets: {
    label: "Tickets",
    icon: Ticket,
    badgeVariant: "outline" as const,
  },
  website: {
    label: "Website",
    icon: Globe,
    badgeVariant: "outline" as const,
  },
  booking: {
    label: "Booking",
    icon: Calendar,
    badgeVariant: "outline" as const,
  },
  presskit: {
    label: "Press Kit",
    icon: FileText,
    badgeVariant: "outline" as const,
  },
  newsletter: {
    label: "Newsletter",
    icon: Mail,
    badgeVariant: "outline" as const,
  },
  donate: {
    label: "Donate",
    icon: Heart,
    badgeVariant: "outline" as const,
  },
  other: {
    label: "Link",
    icon: ExternalLink,
    badgeVariant: "outline" as const,
  },
} as const;

export type LinkType = keyof typeof LINK_TYPES;

export interface LinkItemData {
  id: string;
  title: string;
  url: string;
  type: string;
  active: boolean;
  clicks?: number;
}

interface LinkItemProps {
  readonly link: LinkItemData;
  readonly onToggleActive: (id: string, active: boolean) => void;
  readonly disabled?: boolean;
  /** Shows a drag handle affordance when the row is draggable. */
  readonly draggable?: boolean;
}

/**
 * Truncate URL for preview display
 */
function truncateUrl(url: string, maxLength: number = 40): string {
  try {
    const urlObj = new URL(url);
    const display = urlObj.hostname + urlObj.pathname;
    if (display.length <= maxLength) return display;
    return display.substring(0, maxLength - 3) + "...";
  } catch {
    // If URL parsing fails, just truncate the string
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  }
}

/**
 * Get link type metadata with fallback
 */
function getLinkTypeInfo(type: string): {
  label: string;
  icon: LucideIcon;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
} {
  const normalizedType = type.toLowerCase().replaceAll(/\s+/g, "-");
  return LINK_TYPES[normalizedType as LinkType] ?? LINK_TYPES.other;
}

/**
 * LinkItem Component
 * Requirements: 6.5 - Display each link with title, URL preview, type badge, and active toggle
 *
 * Features:
 * - Displays link title prominently
 * - Shows truncated URL preview
 * - Type badge with icon indicating link category
 * - Switch toggle to enable/disable link visibility
 * - Visual feedback for active/inactive state
 */
export function LinkItem({
  link,
  onToggleActive,
  disabled = false,
  draggable = false,
}: LinkItemProps) {
  const typeInfo = getLinkTypeInfo(link.type);
  const Icon = typeInfo.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-all",
        link.active
          ? "border-primary/30 bg-card shadow-sm"
          : "border-border/50 bg-muted/30 opacity-75"
      )}
    >
      {/* Drag handle */}
      {draggable && (
        <GripVertical
          className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground/60 active:cursor-grabbing"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          link.active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <h4
          className={cn(
            "truncate font-medium transition-colors",
            link.active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {link.title}
        </h4>

        {/* URL Preview + click count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate">{truncateUrl(link.url)}</span>
          {link.clicks !== undefined && link.clicks > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs">
              <MousePointerClick className="h-3 w-3" />
              {link.clicks}
            </span>
          )}
        </div>
      </div>

      {/* Type Badge */}
      <Badge
        variant={typeInfo.badgeVariant}
        className={cn(
          "shrink-0 text-xs",
          !link.active && "opacity-60"
        )}
      >
        {typeInfo.label}
      </Badge>

      {/* Active Toggle */}
      <Switch
        checked={link.active}
        onCheckedChange={(checked) => onToggleActive(link.id, checked)}
        disabled={disabled}
        aria-label={`Toggle ${link.title} visibility`}
        className="shrink-0"
      />
    </div>
  );
}
