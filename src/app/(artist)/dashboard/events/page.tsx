"use client";

import { EventItem, EventItemSkeleton, type EventItemData } from "@/components/dashboard/event-item";
import { EventStatsRow } from "@/components/dashboard/event-stats-row";
import { CreateEventDialog, type CreateEventData } from "@/components/forms/create-event-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";

/**
 * Handle managing an event (placeholder for future edit functionality)
 * Moved to outer scope as it doesn't depend on component state
 */
function handleManageEvent(id: string): void {
  // Future: Implement event edit dialog or navigation
  toast.info(`Managing event ${id} - Edit functionality coming soon`);
}

/**
 * Artist Events Management Page
 * Requirements: 7.1-7.5
 *
 * - Display stats (Total Tickets Sold, Gross Revenue, Upcoming Shows) (7.1)
 * - Display list of events with image, title, date, venue, tickets sold, revenue, status badge (7.2)
 * - "Create Event" button (7.3)
 * - Store date, city, venue, ticket URL, image URL when creating (7.4)
 * - "Manage" button for event details and edit options (7.5)
 */
export default function EventsPage() {
  const events = useQuery(api.events.getCurrentArtistEvents);
  const stats = useQuery(api.events.getEventStats);
  const createEvent = useMutation(api.events.create);

  const isLoading = events === undefined || stats === undefined;

  /**
   * Handle creating a new event
   */
  async function handleCreateEvent(data: CreateEventData): Promise<void> {
    try {
      await createEvent({
        title: data.title,
        date: data.date,
        city: data.city,
        venue: data.venue,
        ticketUrl: data.ticketUrl,
        imageUrl: data.imageUrl,
      });
      toast.success("Event created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create event";
      toast.error(message);
      throw error; // Re-throw to keep dialog open on error
    }
  }

  if (isLoading) {
    return <EventsSkeleton />;
  }

  // Transform Convex data to EventItemData format
  const eventItems: EventItemData[] = (events ?? []).map((event: {
    _id: string;
    title: string;
    date: number;
    venue: string;
    city: string;
    imageUrl?: string;
    ticketsSold: number;
    revenue: number;
    status: "upcoming" | "sold-out" | "past";
  }) => ({
    id: event._id,
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
    imageUrl: event.imageUrl,
    ticketsSold: event.ticketsSold,
    revenue: event.revenue,
    status: event.status,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Events & Tours
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your concerts, shows, and tour dates
          </p>
        </div>
        <CreateEventDialog onCreateEvent={handleCreateEvent} />
      </div>

      {/* Stats Row */}
      <EventStatsRow
        stats={stats ?? { totalTicketsSold: 0, grossRevenue: 0, upcomingShows: 0 }}
        isLoading={false}
      />

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Events
          </CardTitle>
          <CardDescription>
            <EventsDescription count={eventItems.length} upcomingCount={eventItems.filter((e) => e.status === "upcoming").length} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventItems.length === 0 ? (
            <EmptyState onCreateEvent={handleCreateEvent} />
          ) : (
            <div className="space-y-4">
              {eventItems.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onManage={handleManageEvent}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


/**
 * Events description helper to avoid nested ternary
 */
function EventsDescription({ count, upcomingCount }: { readonly count: number; readonly upcomingCount: number }) {
  if (count === 0) {
    return <>Add events and tour dates for your fans to discover</>;
  }
  const eventWord = count === 1 ? "event" : "events";
  return <>{count} {eventWord} • {upcomingCount} upcoming</>;
}

/**
 * Empty state when no events exist
 */
function EmptyState({ onCreateEvent }: { readonly onCreateEvent: (data: CreateEventData) => Promise<void> }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-medium">No events yet</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Create your first event or tour date. Fans will see these on your public hub under &quot;Tour Dates&quot;.
      </p>
      <CreateEventDialog onCreateEvent={onCreateEvent} />
    </div>
  );
}

/**
 * Loading skeleton
 */
function EventsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <EventItemSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
