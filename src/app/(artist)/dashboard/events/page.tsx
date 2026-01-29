"use client";

import { CreateEventDialog, type CreateEventData } from "@/components/forms/create-event-dialog";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { EventsContent } from "./components/events-content";

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
  const createEvent = useMutation(api.events.create);

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
      throw error;
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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

      <SuspenseWrapper fallback={<DashboardSkeleton variant="list" />}>
        <EventsContent />
      </SuspenseWrapper>
    </div>
  );
}
