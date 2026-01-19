"use client";

/**
 * AddPaymentMethodDialog Component
 * Requirements: R-FAN-PM-2.2 - Add payment method via Stripe Elements
 *
 * Dialog for adding a new payment method using Stripe SetupIntent.
 * Uses Stripe Elements for PCI-compliant card collection.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentMethodForm } from "./PaymentMethodForm";

// Initialize Stripe (singleton)
let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface AddPaymentMethodDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly clientSecret: string | null;
  readonly onSuccess?: () => void;
}

/**
 * AddPaymentMethodDialog - Main dialog wrapper component
 * Manages Elements state and key reset on close
 */
export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  clientSecret,
  onSuccess,
}: AddPaymentMethodDialogProps) {
  // Key for resetting Elements state on close
  const [elementsKey, setElementsKey] = useState(0);

  // Reset Elements key when dialog closes
  useEffect(() => {
    if (!open) {
      // Increment key to force Elements remount on next open
      setElementsKey((prev) => prev + 1);
    }
  }, [open]);

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const stripePromiseInstance = getStripePromise();

  if (stripePromiseInstance === null) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add a payment method</DialogTitle>
          <DialogDescription>
            Add a new card to make purchases easier and faster.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {clientSecret === null ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Initializing Stripe…
            </p>
          </div>
        ) : (
          /* Stripe Elements Wrapper */
          <Elements
            key={elementsKey}
            stripe={stripePromiseInstance}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "hsl(var(--primary))",
                  colorBackground: "hsl(var(--background))",
                  colorText: "hsl(var(--foreground))",
                  colorDanger: "hsl(var(--destructive))",
                  fontFamily: "var(--font-sans)",
                  borderRadius: "0.5rem",
                },
              },
            } satisfies StripeElementsOptions}
          >
            <PaymentMethodForm onCancel={handleCancel} onSuccess={handleSuccess} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
