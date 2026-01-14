"use client";

/**
 * PurchaseItem Component
 * Requirements: 10.2, 10.3, 10.4 - Display purchase with download button and status
 *
 * Fan dashboard component for displaying individual purchase items.
 * Shows purchase details and allows downloading digital content.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Download, Music, ShoppingBag, Ticket, Video } from "lucide-react";
import Image from "next/image";

/**
 * Purchase type configuration
 */
const typeConfig = {
  music: {
    label: "Music",
    icon: Music,
    badgeClassName: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  video: {
    label: "Video",
    icon: Video,
    badgeClassName: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  merch: {
    label: "Merch",
    icon: ShoppingBag,
    badgeClassName: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  ticket: {
    label: "Ticket",
    icon: Ticket,
    badgeClassName: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
} as const;

/**
 * Status configuration for tickets/merch
 */
const statusConfig = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  shipped: {
    label: "Shipped",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
} as const;

export type PurchaseType = keyof typeof typeConfig;
export type PurchaseStatus = keyof typeof statusConfig;

export interface PurchaseItemData {
  id: string;
  title: string;
  type: PurchaseType;
  artistName: string;
  artistSlug?: string;
  imageUrl?: string;
  priceUSD: number;
  purchaseDate: number; // timestamp
  isDownloadable: boolean;
  status?: PurchaseStatus; // For tickets/merch
  productId?: string;
}

interface PurchaseItemProps {
  readonly purchase: PurchaseItemData;
  readonly onDownload?: (purchaseId: string, productId: string) => void;
  readonly onViewDetails?: (purchaseId: string) => void;
  readonly isDownloading?: boolean;
  readonly disabled?: boolean;
}

/**
 * Format price for display
 */
function formatPrice(priceUSD: number): string {
  if (priceUSD === 0) {
    return "Free";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceUSD);
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * PurchaseItem - Display individual purchase with download capability
 */
export function PurchaseItem({
  purchase,
  onDownload,
  onViewDetails,
  isDownloading = false,
  disabled = false,
}: PurchaseItemProps) {
  const config = typeConfig[purchase.type];
  const TypeIcon = config.icon;
  const showStatus = purchase.status && (purchase.type === "ticket" || purchase.type === "merch");
  const statusInfo = purchase.status ? statusConfig[purchase.status] : null;

  const handleDownload = () => {
    if (purchase.isDownloadable && purchase.productId && onDownload) {
      onDownload(purchase.id, purchase.productId);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(purchase.id);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start gap-4 rounded-xl border p-4 transition-all",
        "border-border/50 bg-card shadow-sm hover:shadow-md",
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      {/* Image */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {purchase.imageUrl ? (
          <Image
            src={purchase.imageUrl}
            alt={purchase.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Type Badge */}
        <Badge
          variant="outline"
          className={cn("gap-1 text-xs w-fit", config.badgeClassName)}
        >
          <TypeIcon className="h-3 w-3" />
          {config.label}
        </Badge>

        {/* Title */}
        <h4 className="font-semibold text-base line-clamp-2">
          {purchase.title}
        </h4>

        {/* Artist Name */}
        <p className="text-sm text-muted-foreground">
          by {purchase.artistName}
        </p>

        {/* Date and Price */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {formatDate(purchase.purchaseDate)}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium text-foreground">
            {formatPrice(purchase.priceUSD)}
          </span>
        </div>
      </div>

      {/* Actions Column */}
      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        {/* Status Badge (for tickets/merch) */}
        {showStatus && statusInfo && (
          <Badge
            variant="outline"
            className={cn("text-xs", statusInfo.className)}
          >
            {statusInfo.label}
          </Badge>
        )}

        {/* Download Button (for downloadable items) */}
        {purchase.isDownloadable && (
          <Button
            variant="default"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={handleDownload}
            disabled={disabled || isDownloading || !purchase.productId}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        )}

        {/* View Details Link */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto"
          onClick={handleViewDetails}
          disabled={disabled}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for PurchaseItem
 */
export function PurchaseItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-border/50 p-4">
      <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-full sm:w-28" />
        <Skeleton className="h-8 w-full sm:w-24" />
      </div>
    </div>
  );
}
