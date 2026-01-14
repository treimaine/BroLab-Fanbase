"use client";

/**
 * OrderDetailsDialog Component
 * Requirements: 10.5 - View order details modal
 *
 * Displays detailed information about a purchase order including:
 * - Order ID and date
 * - Payment status
 * - All items in the order
 * - Total amount
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Music, ShoppingBag, Ticket, Video } from "lucide-react";
import Image from "next/image";

/**
 * Type configuration
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

export interface OrderDetailsData {
  order: {
    _id: string;
    totalUSD: number;
    currency: string;
    status: string;
    stripeSessionId?: string;
    createdAt: number;
  };
  items: Array<{
    _id: string;
    priceUSD: number;
    type: "music" | "video" | "merch" | "ticket";
    product: {
      _id: string;
      title: string;
      coverImageUrl?: string;
    };
    artist: {
      _id: string;
      displayName: string;
      artistSlug?: string;
    };
  }>;
}

interface OrderDetailsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly orderDetails: OrderDetailsData | null;
  readonly isLoading?: boolean;
}

/**
 * Format price for display
 */
function formatPrice(priceUSD: number, currency = "USD"): string {
  if (priceUSD === 0) {
    return "Free";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format order ID for display (last 8 characters)
 */
function formatOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

/**
 * OrderDetailsDialog - Display detailed order information
 */
export function OrderDetailsDialog({
  open,
  onOpenChange,
  orderDetails,
  isLoading = false,
}: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View your order information and purchased items
          </DialogDescription>
        </DialogHeader>

        {isLoading && <OrderDetailsLoading />}
        
        {!isLoading && orderDetails && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm font-medium">
                    #{formatOrderId(orderDetails.order._id)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20"
                >
                  {orderDetails.order.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="text-sm font-medium">
                  {formatDate(orderDetails.order.createdAt)}
                </p>
              </div>

              {orderDetails.order.stripeSessionId && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {orderDetails.order.stripeSessionId}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold">Items</h4>
              <div className="space-y-3">
                {orderDetails.items.map((item) => {
                  const config = typeConfig[item.type];
                  const TypeIcon = config.icon;

                  return (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      {/* Image */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.product.coverImageUrl ? (
                          <Image
                            src={item.product.coverImageUrl}
                            alt={item.product.title}
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

                      {/* Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <Badge
                          variant="outline"
                          className={cn("gap-1 text-xs w-fit", config.badgeClassName)}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        <p className="font-medium text-sm line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {item.artist.displayName}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatPrice(item.priceUSD)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between">
              <p className="font-semibold">Total</p>
              <p className="text-xl font-bold">
                {formatPrice(
                  orderDetails.order.totalUSD,
                  orderDetails.order.currency
                )}
              </p>
            </div>

            {/* Footer Note */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Need help with this order? Contact support with your order ID.
              </p>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}

        {!isLoading && !orderDetails && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Order details not available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Loading skeleton for order details
 */
function OrderDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Separator />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
