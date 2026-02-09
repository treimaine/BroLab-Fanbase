"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { CalendarIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/**
 * Event form validation schema
 */
const editEventFormSchema = z.object({
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
  status: z.enum(["upcoming", "sold-out", "past"]),
  ticketsSold: z
    .string()
    .min(1, "Tickets sold is required")
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), {
      message: "Tickets sold must be a positive whole number",
    }),
  revenue: z
    .string()
    .min(1, "Revenue is required")
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
      message: "Revenue must be a positive number",
    }),
});

type EditEventFormValues = z.infer<typeof editEventFormSchema>;

export interface EditEventData {
  title: string;
  date: number;
  city: string;
  venue: string;
  ticketUrl?: string;
  imageUrl?: string;
  imageFile?: File;
  status: "upcoming" | "sold-out" | "past";
  ticketsSold: number;
  revenue: number;
}

export interface EventToEdit {
  id: string;
  title: string;
  date: number;
  city: string;
  venue: string;
  ticketUrl?: string;
  imageUrl?: string;
  imageStorageId?: string;
  status: "upcoming" | "sold-out" | "past";
  ticketsSold: number;
  revenue: number;
}

interface EditEventDialogProps {
  readonly event: EventToEdit | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onUpdateEvent: (id: string, data: EditEventData) => Promise<void>;
  readonly onDeleteEvent: (id: string) => Promise<void>;
}

/**
 * Format timestamp to datetime-local input format
 */
function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * EditEventDialog Component
 * Requirements: 7.5 - Edit event dialog with form validation
 */
export function EditEventDialog({
  event,
  open,
  onOpenChange,
  onUpdateEvent,
  onDeleteEvent,
}: EditEventDialogProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Get image URL from Convex Storage if imageStorageId exists
  const storageImageUrl = useQuery(
    api.files.getImageUrl,
    event?.imageStorageId ? { storageId: event.imageStorageId as any } : "skip"
  );
  
  // Determine which image to display (priority: preview > storage > URL)
  const displayImageUrl = imagePreview || storageImageUrl || event?.imageUrl;

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    values: event
      ? {
          title: event.title,
          date: formatDateForInput(event.date),
          city: event.city,
          venue: event.venue,
          ticketUrl: event.ticketUrl || "",
          imageUrl: event.imageUrl || "",
          status: event.status,
          ticketsSold: String(event.ticketsSold),
          revenue: String(event.revenue),
        }
      : undefined,
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  /**
   * Handle image selection with validation
   */
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Please select a valid image file (JPEG, PNG, or WebP)");
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError("Image must be less than 5MB");
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Clear selected image
   */
  function clearImage() {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  /**
   * Trigger file input click
   */
  function triggerImageUpload() {
    imageInputRef.current?.click();
  }

  async function onSubmit(data: EditEventFormValues) {
    if (!event) return;

    try {
      const dateTimestamp = new Date(data.date).getTime();

      await onUpdateEvent(event.id, {
        title: data.title,
        date: dateTimestamp,
        city: data.city,
        venue: data.venue,
        ticketUrl: data.ticketUrl?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        imageFile: selectedImage ?? undefined,
        status: data.status,
        ticketsSold: Number(data.ticketsSold),
        revenue: Number(data.revenue),
      });
      onOpenChange(false);
    } catch {
      // Error handling is done by the parent component
    }
  }

  async function handleDelete() {
    if (!event) return;

    setIsDeleting(true);
    try {
      await onDeleteEvent(event.id);
      setShowDeleteAlert(false);
      onOpenChange(false);
    } catch {
      // Error handling is done by the parent component
    } finally {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!isSubmitting && !isDeleting) {
      onOpenChange(newOpen);
    }
  }

  if (!event) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Event</DialogTitle>
            <DialogDescription>
              Update event details, metrics, and status
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Image Upload */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Event Image</div>
                <div className="flex items-start gap-4">
                  {/* Clickable Avatar/Image Preview */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={triggerImageUpload}
                      disabled={isSubmitting}
                      className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {displayImageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayImageUrl}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/30">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center px-2">
                            Click to upload
                          </span>
                        </div>
                      )}
                    </button>
                    {(imagePreview || selectedImage) && (
                      <button
                        type="button"
                        onClick={clearImage}
                        disabled={isSubmitting}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />

                  {/* Info text */}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Click the image to upload a new event poster
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                    {selectedImage && (
                      <p className="text-xs text-primary font-medium">
                        New image selected: {selectedImage.name}
                      </p>
                    )}
                    {imageError && (
                      <p className="text-sm text-destructive">{imageError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ticket URL Field */}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image URL Field */}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="sold-out">Sold Out</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of the event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Tickets Sold Field */}
                <FormField
                  control={form.control}
                  name="ticketsSold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tickets Sold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Revenue Field */}
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={isSubmitting || isDeleting}
                  className="rounded-full sm:mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting || isDeleting}
                    className="rounded-full flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isDeleting}
                    className="rounded-full flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
