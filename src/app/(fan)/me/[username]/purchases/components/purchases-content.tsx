"use client";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { OrderDetailsDialog, type OrderDetailsData } from "@/components/fan/order-details-dialog";
import type { PurchaseItemData } from "@/components/fan/purchase-item";
import { PurchaseItem } from "@/components/fan/purchase-item";
import { useAction, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export function PurchasesContent() {
  const purchases = useQuery(api.orders.getMyPurchases);
  const getDownloadUrl = useAction(api.downloads.getDownloadUrl);

  const [downloadingProducts, setDownloadingProducts] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const orderDetails = useQuery(
    api.orders.getOrderById,
    selectedOrderId ? { orderId: selectedOrderId } : "skip"
  );

  const purchaseItems = useMemo<Array<PurchaseItemData & { orderId: Id<"orders"> }>>(() => {
    if (!purchases) return [];

    const items: Array<PurchaseItemData & { orderId: Id<"orders"> }> = [];

    purchases.forEach((purchase: { order: any; items: any[] }) => {
      purchase.items.forEach((item: any) => {
        if (!item) return;

        items.push({
          id: item._id,
          orderId: purchase.order._id,
          title: item.product.title,
          type: item.product.type,
          artistName: item.artist.displayName,
          artistSlug: item.artist.artistSlug,
          imageUrl: item.product.coverImageUrl,
          priceUSD: item.priceUSD,
          purchaseDate: purchase.order.createdAt,
          isDownloadable: item.fileStorageId !== undefined,
          productId: item.productId,
        });
      });
    });

    return items.sort((a, b) => b.purchaseDate - a.purchaseDate);
  }, [purchases]);

  const handleDownload = useCallback(async (purchaseId: string, productId: string) => {
    setDownloadingProducts((prev: Set<string>) => new Set(prev).add(productId));

    try {
      const result = await getDownloadUrl({ productId: productId as Id<"products"> });

      if (result?.url) {
        const link = document.createElement("a");
        link.href = result.url;
        link.download = result.productTitle || "download";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success(`Downloading ${result.productTitle || "file"}...`);
      } else {
        throw new Error("No download URL received");
      }
    } catch (error) {
      console.error("Download error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to download";
      toast.error(errorMessage);
    } finally {
      setDownloadingProducts((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [getDownloadUrl]);

  const handleViewDetails = useCallback((purchaseId: string) => {
    const purchase = purchaseItems.find((p) => p.id === purchaseId);
    if (purchase?.orderId) {
      setSelectedOrderId(purchase.orderId);
      setIsOrderDetailsOpen(true);
    } else {
      toast.error("Unable to load order details");
    }
  }, [purchaseItems]);

  if (purchaseItems.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="space-y-4">
        {purchaseItems.map((purchase) => (
          <PurchaseItem
            key={purchase.id}
            purchase={purchase}
            onDownload={handleDownload}
            onViewDetails={handleViewDetails}
            isDownloading={purchase.productId ? downloadingProducts.has(purchase.productId) : false}
          />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Downloaded content is for personal use only. 
          Redistribution or commercial use is prohibited.
        </p>
      </div>

      <OrderDetailsDialog
        open={isOrderDetailsOpen}
        onOpenChange={setIsOrderDetailsOpen}
        orderDetails={orderDetails as OrderDetailsData | null}
        isLoading={orderDetails === undefined}
      />
    </>
  );
}
