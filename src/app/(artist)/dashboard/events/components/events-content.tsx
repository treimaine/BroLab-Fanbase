"use client";

import { EventItem, type EventItemData } from "@/components/dashboard/event-item";
import { EventStatsRow } from "@/components/dashboard/event-stats-row";
import { CreateEventDialog, type CreateEventData } from "@/components/forms/create-event-dialog";
import { EditEventDialog, type EditEventData, type EventToEdit } from "@/components/forms/edit-event-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleMutationError } from "@/lib/limit-toast";
import { useMutation, useQuery } from "convex/react";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";

function EventsDescription({ count, upcomingCount }: { readonly count: number; readonly upcomingCount: number }) {
  if (count === 0) {
    return <>Add events and tour dates for your fans to discover</>;
  }
  const eventWord = count === 1 ? "event" : "events";
  return <>{count} {eventWord} • {upcomingCount} upcoming</>;
}

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

export function EventsContent() {
  const events = useQuery(api.events.getCurrentArtistEvents);
  const stats = useQuery(api.events.getEventStats);
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const deleteEvent = useMutation(api.events.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [editingEvent, setEditingEvent] = useState<EventToEdit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      // Handle limit errors with upgrade toast (R-ART-SUB-5.6, R-ART-SUB-6.5)
      handleMutationError(error, "Failed to create event", "events");
      throw error;
    }
  }

  async function handleUpdateEvent(id: string, data: EditEventData): Promise<void> {
    try {
      let imageStorageId: string | undefined;

      // If there's a file to upload, upload it first
      if (data.imageFile) {
        // Generate upload URL for image
        const uploadUrl = await generateUploadUrl({
          fileSize: data.imageFile.size,
        });

        // Upload the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": data.imageFile.type },
          body: data.imageFile,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await updateEvent({
        eventId: id as any,
        title: data.title,
        date: data.date,
        city: data.city,
        venue: data.venue,
        ticketUrl: data.ticketUrl,
        imageUrl: data.imageUrl,
        imageStorageId: imageStorageId as any,
        status: data.status,
        ticketsSold: data.ticketsSold,
        revenue: data.revenue,
      });
      toast.success("Event updated successfully");
    } catch (error) {
      handleMutationError(error, "Failed to update event", "events");
      throw error;
    }
  }

  async function handleDeleteEvent(id: string): Promise<void> {
    try {
      await deleteEvent({ eventId: id as any });
      toast.success("Event deleted successfully");
    } catch (error) {
      handleMutationError(error, "Failed to delete event", "events");
      throw error;
    }
  }

  function handleManageEvent(id: string): void {
    const event = events?.find((e) => e._id === id);
    if (event) {
      setEditingEvent({
        id: event._id,
        title: event.title,
        date: event.date,
        city: event.city,
        venue: event.venue,
        ticketUrl: event.ticketUrl,
        imageUrl: event.imageUrl,
        imageStorageId: event.imageStorageId,
        status: event.status,
        ticketsSold: event.ticketsSold,
        revenue: event.revenue,
      });
      setIsEditDialogOpen(true);
    }
  }

  const eventItems: EventItemData[] = (events ?? []).map((event) => ({
    id: event._id,
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
    imageUrl: event.imageUrl,
    imageStorageId: event.imageStorageId,
    ticketsSold: event.ticketsSold,
    revenue: event.revenue,
    status: event.status,
  }));

  return (
    <>
      <EventStatsRow
        stats={stats ?? { totalTicketsSold: 0, grossRevenue: 0, upcomingShows: 0 }}
        isLoading={false}
      />

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

      <EditEventDialog
        event={editingEvent}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </>
  );
}
