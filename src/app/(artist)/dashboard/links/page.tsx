"use client";

/**
 * Artist Custom Links Management Page (Refactored with Suspense)
 * Requirements: 6.1-6.5, R-CL-1..5
 *
 * UX Improvements:
 * - Suspense boundaries for better loading states
 * - Dedicated skeleton for links page
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { LinkItem, type LinkItemData } from "@/components/dashboard/link-item";
import { AddLinkDialog, type AddLinkData } from "@/components/forms/add-link-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton, SuspenseWrapper } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

export default function LinksPage() {
  const links = useQuery(api.links.getCurrentArtistLinks);
  const createLink = useMutation(api.links.create);
  const toggleActive = useMutation(api.links.toggleActive);

  const isLoading = links === undefined;

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
      throw error;
    }
  }

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
    return <DashboardSkeleton variant="list" />;
  }

  const SOCIAL_LINK_TYPES = new Set(["instagram", "youtube", "spotify", "apple-music", "video"]);

  const linkItems: LinkItemData[] = (links ?? [])
    .filter((link: { type: string }) => !SOCIAL_LINK_TYPES.has(link.type.toLowerCase()))
    .map((link: { _id: string; title: string; url: string; type: string; active: boolean }) => ({
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
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Custom Links</h1>
          <p className="mt-1 text-muted-foreground">
            Add links for merch, booking, press kit, newsletter, etc. For social media, use{" "}
            <a
              href="/dashboard/profile"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Profile &amp; Bio → Social Links
            </a>
            .
          </p>
        </div>
        <AddLinkDialog onAddLink={handleAddLink} />
      </div>

      {/* Links List with Suspense */}
      <SuspenseWrapper fallback={<DashboardSkeleton variant="list" />}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Your Custom Links
            </CardTitle>
            <CardDescription>
              <LinksDescription
                count={linkItems.length}
                activeCount={linkItems.filter((l) => l.active).length}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkItems.length === 0 ? (
              <EmptyState onAddLink={handleAddLink} />
            ) : (
              <div className="space-y-3">
                {linkItems.map((link) => (
                  <LinkItem key={link.id} link={link} onToggleActive={handleToggleActive} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SuspenseWrapper>
    </div>
  );
}

function LinksDescription({
  count,
  activeCount,
}: {
  readonly count: number;
  readonly activeCount: number;
}) {
  if (count === 0) {
    return <>Add custom links for merch, booking, press kit, and more</>;
  }
  const linkWord = count === 1 ? "link" : "links";
  return (
    <>
      {count} {linkWord} • {activeCount} active
    </>
  );
}

function EmptyState({ onAddLink }: { readonly onAddLink: (data: AddLinkData) => Promise<void> }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Link2 className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-medium">No custom links yet</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Add links to your merch store, booking page, press kit, newsletter signup, and more. Social
        platforms are managed in Profile &amp; Bio.
      </p>
      <AddLinkDialog onAddLink={onAddLink} />
    </div>
  );
}
