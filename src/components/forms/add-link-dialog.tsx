"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { LINK_TYPES } from "@/components/dashboard/link-item";
import { isSocialPlatformUrl, SOCIAL_PLATFORM_ERROR_MESSAGE } from "@/lib/constants";

/**
 * Link form validation schema
 * Requirements: 6.3 - Form validation for title, URL, and type
 * Requirements: R-CL-2, R-CL-3 - Reject social/streaming platform URLs
 */
const addLinkFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  url: z
    .string()
    .min(1, "URL is required")
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" }
    )
    .refine(
      (val) => !isSocialPlatformUrl(val),
      { message: SOCIAL_PLATFORM_ERROR_MESSAGE }
    ),
  type: z.string().min(1, "Please select a link type"),
});

type AddLinkFormValues = z.infer<typeof addLinkFormSchema>;

export interface AddLinkData {
  title: string;
  url: string;
  type: string;
}

interface AddLinkDialogProps {
  readonly onAddLink: (data: AddLinkData) => Promise<void>;
  readonly trigger?: React.ReactNode;
  readonly disabled?: boolean;
}

/**
 * AddLinkDialog Component
 * Requirements: 6.3 - Add link dialog with form validation
 *
 * Features:
 * - Title input field
 * - URL input field with validation
 * - Type selector dropdown
 * - Inline validation with FormMessage
 * - Loading state during submission
 */
export function AddLinkDialog({
  onAddLink,
  trigger,
  disabled = false,
}: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<AddLinkFormValues>({
    resolver: zodResolver(addLinkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: AddLinkFormValues) {
    try {
      await onAddLink({
        title: data.title,
        url: data.url,
        type: data.type,
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

  // Get link types as array for the select
  const linkTypeOptions = Object.entries(LINK_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={disabled} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Business Link</DialogTitle>
          <DialogDescription>
            Add a business link to your hub. For social media, use Profile & Bio → Social Links.
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Latest Release"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The display name for this link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL Field */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/my-link"
                      type="url"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The destination URL for this link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a link type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {linkTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the category for this business link
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
                    Adding...
                  </>
                ) : (
                  "Add Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
