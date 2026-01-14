"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Event form validation schema
 * Requirements: 7.4 - Form validation for title, date, city, venue, ticket URL, image URL
 */
const createEventFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (val) => {
        const date = new Date(val);
        return !Number.isNaN(date.getTime());
      },
      { message: "Please enter a valid date" }
    ),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters"),
  venue: z
    .string()
    .min(1, "Venue is required")
    .max(200, "Venue must be less than 200 characters"),
  ticketUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" }
    ),
  imageUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" }
    ),
});

type CreateEventFormValues = z.infer<typeof createEventFormSchema>;

export interface CreateEventData {
  title: string;
  date: number; // timestamp
  city: string;
  venue: string;
  ticketUrl?: string;
  imageUrl?: string;
}

interface CreateEventDialogProps {
  readonly onCreateEvent: (data: CreateEventData) => Promise<void>;
  readonly trigger?: React.ReactNode;
  readonly disabled?: boolean;
}

/**
 * CreateEventDialog Component
 * Requirements: 7.4 - Create event dialog with form validation
 *
 * Features:
 * - Title input field
 * - Date input field (datetime-local)
 * - City input field
 * - Venue input field
 * - Ticket URL input field (optional)
 * - Image URL input field (optional)
 * - Inline validation with FormMessage
 * - Loading state during submission
 */
export function CreateEventDialog({
  onCreateEvent,
  trigger,
  disabled = false,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: "",
      date: "",
      city: "",
      venue: "",
      ticketUrl: "",
      imageUrl: "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: CreateEventFormValues) {
    try {
      // Convert date string to timestamp
      const dateTimestamp = new Date(data.date).getTime();

      await onCreateEvent({
        title: data.title,
        date: dateTimestamp,
        city: data.city,
        venue: data.venue,
        ticketUrl: data.ticketUrl?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      // Error handling is done by the parent component
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={disabled} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event or tour date. Fans will see this on your public hub.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Tour 2026 - NYC"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your event or show
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    When the event takes place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City Field */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="New York, NY"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The city where the event is held
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Venue Field */}
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Madison Square Garden"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The venue or location name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticket URL Field (Optional) */}
            <FormField
              control={form.control}
              name="ticketUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://tickets.example.com/event"
                      type="url"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Link where fans can purchase tickets
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL Field (Optional) */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/event-poster.jpg"
                      type="url"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A promotional image for the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
