"use client";

import { PurchaseItemSkeleton } from "@/components/fan/purchase-item";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { PurchasesContent } from "./components/purchases-content";

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
export default function PurchasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
          <p className="text-muted-foreground">
            View and download your purchased content
          </p>
        </div>

        <SuspenseWrapper
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PurchaseItemSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PurchasesContent />
        </SuspenseWrapper>
      </div>
    </div>
  );
}
