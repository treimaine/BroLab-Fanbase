"use client";

/**
 * PaymentMethodsTab Component
 * Requirements: 11.2, 11.3 - Display saved cards and add payment method
 *
 * Fan billing component for managing payment methods.
 * Shows saved cards with last 4 digits and allows adding/removing payment methods.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CreditCard, Plus, Trash2 } from "lucide-react";

/**
 * Card brand configuration
 */
const cardBrandConfig = {
  visa: {
    label: "Visa",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  mastercard: {
    label: "Mastercard",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  amex: {
    label: "American Express",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  discover: {
    label: "Discover",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  unknown: {
    label: "Card",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
} as const;

export type CardBrand = keyof typeof cardBrandConfig;

export interface PaymentMethodData {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodsTabProps {
  readonly paymentMethods: PaymentMethodData[];
  readonly onAddPaymentMethod?: () => void;
  readonly onRemovePaymentMethod?: (methodId: string) => void;
  readonly isLoading?: boolean;
  readonly isRemoving?: string | null; // ID of method being removed
  readonly disabled?: boolean;
}

/**
 * Format expiry date for display
 */
function formatExpiry(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, "0");
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
}

/**
 * PaymentMethodCard - Display individual payment method
 */
function PaymentMethodCard({
  method,
  onRemove,
  isRemoving,
  disabled,
}: {
  readonly method: PaymentMethodData;
  readonly onRemove?: (methodId: string) => void;
  readonly isRemoving?: boolean;
  readonly disabled?: boolean;
}) {
  const brandConfig = cardBrandConfig[method.brand] || cardBrandConfig.unknown;

  return (
    <Card
      className={cn(
        "p-4 transition-all border-border/50 hover:shadow-md",
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Card Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Card Icon */}
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Card Details */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Brand Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-xs", brandConfig.className)}
              >
                {brandConfig.label}
              </Badge>
              {method.isDefault && (
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  Default
                </Badge>
              )}
            </div>

            {/* Card Number */}
            <p className="font-medium text-sm">
              •••• •••• •••• {method.last4}
            </p>

            {/* Expiry */}
            <p className="text-xs text-muted-foreground">
              Expires {formatExpiry(method.expiryMonth, method.expiryYear)}
            </p>
          </div>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove?.(method.id)}
          disabled={disabled || isRemoving}
          aria-label="Remove payment method"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

/**
 * PaymentMethodsTab - Main component for managing payment methods
 */
export function PaymentMethodsTab({
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  isLoading = false,
  isRemoving = null,
  disabled = false,
}: PaymentMethodsTabProps) {
  if (isLoading) {
    return <PaymentMethodsTabSkeleton />;
  }

  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved payment methods
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={onAddPaymentMethod}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {/* Payment Methods List */}
      {hasPaymentMethods ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onRemove={onRemovePaymentMethod}
              isRemoving={isRemoving === method.id}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddPaymentMethod={onAddPaymentMethod} disabled={disabled} />
      )}

      {/* Security Notice */}
      <Card className="p-4 bg-muted/50 border-border/50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium mb-1">Secure Payments</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All payment information is securely stored and processed by Stripe.
              We never store your full card details on our servers.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Empty state when no payment methods exist
 */
function EmptyState({
  onAddPaymentMethod,
  disabled,
}: {
  readonly onAddPaymentMethod?: () => void;
  readonly disabled?: boolean;
}) {
  return (
    <Card className="p-8 text-center border-dashed border-2 border-border/50">
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-base">No Payment Methods</h4>
          <p className="text-sm text-muted-foreground">
            Add a payment method to make purchases easier and faster.
          </p>
        </div>
        <Button
          variant="default"
          className="gap-2"
          onClick={onAddPaymentMethod}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add Your First Payment Method
        </Button>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for PaymentMethodsTab
 */
export function PaymentMethodsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="p-4 bg-muted/50 border-border/50">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
