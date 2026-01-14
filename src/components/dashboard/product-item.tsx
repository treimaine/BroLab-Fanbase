"use client";

/**
 * ProductItem Component
 * Requirements: 16.1 - Display product with cover image, title, type badge, price, visibility toggle
 *
 * Dashboard component for managing individual digital products.
 * Shows product details and allows visibility toggling.
 */

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Music, Video } from "lucide-react";
import Image from "next/image";

/**
 * Product type configuration
 */
const typeConfig = {
  music: {
    label: "Music",
    icon: Music,
    badgeClassName: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
  },
  video: {
    label: "Video",
    icon: Video,
    badgeClassName: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  },
} as const;

export type ProductType = keyof typeof typeConfig;
export type ProductVisibility = "public" | "private";

export interface ProductItemData {
  id: string;
  title: string;
  type: ProductType;
  priceUSD: number;
  coverImageUrl?: string;
  visibility: ProductVisibility;
}

interface ProductItemProps {
  readonly product: ProductItemData;
  readonly onToggleVisibility: (id: string, visibility: ProductVisibility) => void;
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
 * ProductItem - Dashboard product management card
 */
export function ProductItem({
  product,
  onToggleVisibility,
  disabled = false,
}: ProductItemProps) {
  const config = typeConfig[product.type];
  const TypeIcon = config.icon;
  const isPublic = product.visibility === "public";

  const handleToggle = (checked: boolean) => {
    onToggleVisibility(product.id, checked ? "public" : "private");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-all",
        isPublic
          ? "border-primary/30 bg-card shadow-sm"
          : "border-border/50 bg-muted/30 opacity-75"
      )}
    >
      {/* Cover Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.coverImageUrl ? (
          <Image
            src={product.coverImageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <h4
          className={cn(
            "truncate font-medium transition-colors",
            isPublic ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {product.title}
        </h4>

        {/* Price */}
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.priceUSD)}
        </p>
      </div>

      {/* Type Badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 gap-1 text-xs",
          config.badgeClassName,
          !isPublic && "opacity-60"
        )}
      >
        <TypeIcon className="h-3 w-3" />
        {config.label}
      </Badge>

      {/* Visibility Indicator */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs shrink-0",
          isPublic ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
        )}
      >
        {isPublic ? (
          <>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Public</span>
          </>
        ) : (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Private</span>
          </>
        )}
      </div>

      {/* Visibility Toggle */}
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={`Toggle ${product.title} visibility`}
        className="shrink-0"
      />
    </div>
  );
}

/**
 * Loading skeleton for ProductItem
 */
export function ProductItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 p-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-10 rounded-full" />
    </div>
  );
}
