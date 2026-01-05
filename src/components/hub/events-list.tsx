"use client";

/**
 * EventsList Component
 * Requirements: 3.4 - Display tabs for "Tour Dates" with event cards
 *
 * Displays a list of artist's events/concerts as cards:
 * - Date (formatted)
 * - Venue and city
 * - Status badge (upcoming/sold-out/past)
 * - Tickets button (links to ticketUrl)
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink, MapPin, Ticket } from "lucide-react";
import Image from "next/image";

/**
 * Event interface representing a concert/tour date
 * Based on the events table in Convex schema
 */
export interface Event {
  id: string;
  title: string;
  date: number; // timestamp
  venue: string;
  city: string;
  ticketUrl?: string;
  imageUrl?: string;
  status: "upcoming" | "sold-out" | "past";
}

interface EventsListProps {
  readonly events: Event[];
  readonly onEventClick?: (event: Event) => void;
  readonly isLoading?: boolean;
  readonly className?: string;
}

/**
 * Status badge configuration
 */
const statusConfig = {
  upcoming: {
    label: "Upcoming",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  "sold-out": {
    label: "Sold Out",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  past: {
    label: "Past",
    color: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
};

/**
 * Format date for display
 * Shows: "Sat, Jan 15" format
 */
function formatEventDate(timestamp: number): { day: string; month: string; weekday: string; full: string } {
  const date = new Date(timestamp);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate().toString();
  const full = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return { day, month, weekday, full };
}

/**
 * Event action button component
 * Renders the appropriate button based on event status
 */
function EventActionButton({
  event,
  hasTickets,
}: {
  readonly event: Event;
  readonly hasTickets: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (hasTickets) {
    return (
      <Button
        variant="default"
        size="sm"
        className="rounded-full gap-1.5"
        asChild
        onClick={handleClick}
      >
        <a
          href={event.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get tickets for ${event.title}`}
        >
          <Ticket className="h-4 w-4" />
          <span className="hidden sm:inline">Tickets</span>
          <ExternalLink className="h-3 w-3 hidden sm:inline" />
        </a>
      </Button>
    );
  }

  if (event.status === "sold-out") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled
      >
        Sold Out
      </Button>
    );
  }

  return null;
}

/**
 * Single event card component
 */
function EventCard({
  event,
  onClick,
}: {
  readonly event: Event;
  readonly onClick?: () => void;
}) {
  const config = statusConfig[event.status];
  const dateInfo = formatEventDate(event.date);
  const hasTickets = Boolean(event.ticketUrl) && event.status !== "past";

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/50",
        "transition-all duration-200",
        "hover:shadow-lg hover:border-border",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${event.title} at ${event.venue}, ${event.city} - ${dateInfo.full}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Event Image (optional) */}
        {event.imageUrl && (
          <div className="relative h-32 w-full sm:h-auto sm:w-32 md:w-40 flex-shrink-0 overflow-hidden bg-muted">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 160px"
            />
          </div>
        )}

        {/* Card Content */}
        <div className="flex flex-1 items-start gap-3 p-4 sm:gap-4">
          {/* Date Block */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 px-3 py-2 text-center min-w-[60px]">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {dateInfo.month}
            </span>
            <span className="text-2xl font-bold text-primary">
              {dateInfo.day}
            </span>
            <span className="text-xs text-muted-foreground">
              {dateInfo.weekday}
            </span>
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            {/* Status Badge */}
            <Badge
              variant="outline"
              className={cn("mb-2 text-xs", config.color)}
            >
              {config.label}
            </Badge>

            {/* Title */}
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 mb-1">
              {event.title}
            </h3>

            {/* Venue & City */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 opacity-0" />
              <span className="line-clamp-1">{event.city}</span>
            </div>
          </div>

          {/* Tickets Button */}
          <div className="flex-shrink-0 self-center">
            <EventActionButton event={event} hasTickets={hasTickets} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for event cards
 */
function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex items-start gap-4 p-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </Card>
  );
}

/**
 * Empty state when no events available
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No tour dates yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        This artist hasn&apos;t announced any upcoming shows. Check back soon!
      </p>
    </div>
  );
}

/**
 * EventsList - List of event cards
 */
export function EventsList({
  events,
  onEventClick,
  isLoading = false,
  className,
}: EventsListProps) {
  // Sort events: upcoming first, then by date
  const sortedEvents = [...events].sort((a, b) => {
    // Upcoming events first
    if (a.status === "upcoming" && b.status !== "upcoming") return -1;
    if (a.status !== "upcoming" && b.status === "upcoming") return 1;
    // Then by date (ascending for upcoming, descending for past)
    if (a.status === "upcoming" && b.status === "upcoming") {
      return a.date - b.date;
    }
    return b.date - a.date;
  });

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <EventCardSkeleton key={`event-skeleton-${String(i)}`} />
        ))}
      </div>
    );
  }

  if (sortedEvents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {sortedEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={onEventClick ? () => onEventClick(event) : undefined}
        />
      ))}
    </div>
  );
}
