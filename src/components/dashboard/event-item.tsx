"use client";

/**
 * EventItem Component
 * Requirements: 7.2 - Display event with image, title, date, venue, tickets sold, revenue, status badge, "Manage" button
 *
 * Dashboard component for managing individual events.
 * Shows event details and metrics for artist management.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Calendar, DollarSign, MapPin, Settings, Ticket } from "lucide-react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";

/**
 * Event status configuration
 */
const statusConfig = {
  upcoming: {
    label: "Upcoming",
    variant: "default" as const,
    className: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  },
  "sold-out": {
    label: "Sold Out",
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
  },
  past: {
    label: "Past",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
} as const;

export type EventStatus = keyof typeof statusConfig;

export interface EventItemData {
  id: string;
  title: string;
  date: number; // timestamp
  venue: string;
  city: string;
  imageUrl?: string;
  imageStorageId?: string;
  ticketsSold: number;
  revenue: number;
  status: EventStatus;
}

interface EventItemProps {
  readonly event: EventItemData;
  readonly onManage: (id: string) => void;
  readonly disabled?: boolean;
}

/**
 * Format date for display
 */
function formatEventDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * EventItem - Dashboard event management card
 */
export function EventItem({ event, onManage, disabled = false }: EventItemProps) {
  const config = statusConfig[event.status];
  const formattedDate = formatEventDate(event.date);
  
  // Get image URL from Convex Storage if imageStorageId exists
  const storageImageUrl = useQuery(
    api.files.getImageUrl,
    event.imageStorageId ? { storageId: event.imageStorageId as any } : "skip"
  );
  
  // Prioritize storage image over URL
  const displayImageUrl = storageImageUrl || event.imageUrl;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start gap-4 rounded-xl border p-4 transition-all",
        "border-border/50 bg-card hover:shadow-md hover:border-border"
      )}
    >
      {/* Event Image */}
      <div className="relative h-24 w-full sm:h-20 sm:w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {displayImageUrl ? (
          <Image
            src={displayImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {event.title}
          </h4>
          <Badge variant="outline" className={cn("text-xs", config.className)}>
            {config.label}
          </Badge>
        </div>

        {/* Date & Venue */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {event.venue}, {event.city}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{formatNumber(event.ticketsSold)}</span>
            <span className="text-muted-foreground">tickets sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span className="font-medium">{formatCurrency(event.revenue)}</span>
            <span className="text-muted-foreground">revenue</span>
          </div>
        </div>
      </div>

      {/* Manage Button */}
      <div className="w-full sm:w-auto flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto rounded-full gap-1.5"
          onClick={() => onManage(event.id)}
          disabled={disabled}
        >
          <Settings className="h-4 w-4" />
          Manage
        </Button>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for EventItem
 */
export function EventItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-border/50 p-4">
      <Skeleton className="h-24 w-full sm:h-20 sm:w-28 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-full sm:w-24 rounded-full" />
    </div>
  );
}
