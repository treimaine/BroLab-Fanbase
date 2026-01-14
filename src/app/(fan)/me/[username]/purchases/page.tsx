"use client";

/**
 * Fan Purchases Page
 * Requirements: 10.1-10.5 - Purchase history with downloads
 * 
 * Displays fan's purchase history with:
 * - Product image, type badge, title, artist
 * - Purchase date and price
 * - Download button (if downloadable)
 * - Status badge (for tickets/merch)
 * - View Details link
 * 
 * Connected to Convex orders/orderItems
 */

import { api } from "@/../convex/_generated/api";
import type { PurchaseItemData } from "@/components/fan/purchase-item";
import { PurchaseItem, PurchaseItemSkeleton } from "@/components/fan/purchase-item";
import { useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export default function PurchasesPage() {
  // Fetch purchases from Convex
  const purchases = useQuery(api.orders.getMyPurchases);

  // Loading state
  const isLoading = purchases === undefined;

  // Transform Convex data to PurchaseItemData format
  const purchaseItems = useMemo<PurchaseItemData[]>(() => {
    if (!purchases) return [];

    const items: PurchaseItemData[] = [];

    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (!item) return;

        items.push({
          id: item._id,
          title: item.product.title,
          type: item.product.type, // "music" or "video"
          artistName: item.artist.displayName,
          artistSlug: item.artist.artistSlug,
          imageUrl: item.product.coverImageUrl,
          priceUSD: item.priceUSD,
          purchaseDate: purchase.order.createdAt,
          isDownloadable: item.fileStorageId !== undefined,
          productId: item.productId,
          // Status is not applicable for digital products in MVP
          // Will be added when physical merch/tickets are implemented
        });
      });
    });

    // Sort by purchase date descending (newest first)
    return items.sort((a, b) => b.purchaseDate - a.purchaseDate);
  }, [purchases]);

  // Handle download
  const handleDownload = useCallback(async (purchaseId: string, productId: string) => {
    try {
      // TODO: Implement download via Convex downloads.getDownloadUrl
      // For MVP, show toast notification
      toast.info("Download functionality coming soon!");
      console.log("Download:", { purchaseId, productId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again.");
    }
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((purchaseId: string) => {
    // TODO: Implement order details modal or page
    toast.info("Order details coming soon!");
    console.log("View details:", purchaseId);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
            <p className="text-muted-foreground">
              View and download your purchased content
            </p>
          </div>

          {/* Loading skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PurchaseItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (purchaseItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
            <p className="text-muted-foreground">
              View and download your purchased content
            </p>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No purchases yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              When you purchase music, videos, or tickets from artists, they&apos;ll appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Purchases list
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
          <p className="text-muted-foreground">
            View and download your purchased content
          </p>
        </div>

        {/* Purchases list */}
        <div className="space-y-4">
          {purchaseItems.map((purchase) => (
            <PurchaseItem
              key={purchase.id}
              purchase={purchase}
              onDownload={handleDownload}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Downloaded content is for personal use only. 
            Redistribution or commercial use is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
