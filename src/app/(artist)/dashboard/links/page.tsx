"use client";

import { LinkItem, type LinkItemData } from "@/components/dashboard/link-item";
import { AddLinkDialog, type AddLinkData } from "@/components/forms/add-link-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Artist Custom Links Management Page
 * Requirements: 6.1-6.5, R-CL-1..5
 *
 * - Display list of existing custom links (6.1)
 * - "Add New Link" button (6.2)
 * - Store title, URL, type when adding (6.3)
 * - Toggle link visibility (6.4)
 * - Display title, URL preview, type badge, active toggle (6.5)
 * - Custom links only (merch, booking, press kit, etc.) - NOT social platforms (R-CL-1)
 * - Social/streaming platforms managed in Profile & Bio → Social Links (R-CL-2, R-CL-3)
 */
export default function LinksPage() {
  const links = useQuery(api.links.getCurrentArtistLinks);
  const createLink = useMutation(api.links.create);
  const toggleActive = useMutation(api.links.toggleActive);

  const isLoading = links === undefined;

  /**
   * Handle adding a new link
   */
  async function handleAddLink(data: AddLinkData): Promise<void> {
    try {
      await createLink({
        title: data.title,
        url: data.url,
        type: data.type,
      });
      toast.success("Link added successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add link";
      toast.error(message);
      throw error; // Re-throw to keep dialog open on error
    }
  }

  /**
   * Handle toggling link active status
   */
  async function handleToggleActive(id: string, active: boolean): Promise<void> {
    try {
      await toggleActive({
        linkId: id as Id<"links">,
      });
      toast.success(active ? "Link enabled" : "Link disabled");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update link";
      toast.error(message);
    }
  }

  if (isLoading) {
    return <LinksSkeleton />;
  }

  // Transform Convex data to LinkItemData format
  const linkItems: LinkItemData[] = (links ?? []).map((link) => ({
    id: link._id,
    title: link.title,
    url: link.url,
    type: link.type,
    active: link.active,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Custom Links
          </h1>
          <p className="mt-1 text-muted-foreground">
            Use this for merch, booking, press kit, newsletter, etc. Social platforms are managed in{" "}
            <a href="/dashboard/profile" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Profile &amp; Bio → Social Links
            </a>.
          </p>
        </div>
        <AddLinkDialog onAddLink={handleAddLink} />
      </div>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Your Custom Links
          </CardTitle>
          <CardDescription>
            <LinksDescription count={linkItems.length} activeCount={linkItems.filter((l) => l.active).length} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkItems.length === 0 ? (
            <EmptyState onAddLink={handleAddLink} />
          ) : (
            <div className="space-y-3">
              {linkItems.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  onToggleActive={handleToggleActive}
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
 * Links description helper to avoid nested ternary
 */
function LinksDescription({ count, activeCount }: { readonly count: number; readonly activeCount: number }) {
  if (count === 0) {
    return <>Add custom links for merch, booking, press kit, and more</>;
  }
  const linkWord = count === 1 ? "link" : "links";
  return <>{count} {linkWord} • {activeCount} active</>;
}

/**
 * Empty state when no links exist
 */
function EmptyState({ onAddLink }: { readonly onAddLink: (data: AddLinkData) => Promise<void> }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Link2 className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-medium">No custom links yet</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Add links to your merch store, booking page, press kit, newsletter signup, and more.
        Social platforms are managed in Profile &amp; Bio.
      </p>
      <AddLinkDialog onAddLink={onAddLink} />
    </div>
  );
}

/**
 * Loading skeleton
 */
function LinksSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
