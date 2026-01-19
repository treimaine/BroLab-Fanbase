"use client";

/**
 * PaymentMethodForm Component
 * Requirements: R-FAN-PM-2.2, R-FAN-PM-2.3, R-FAN-PM-7.1
 *
 * Isolated form component for adding payment methods via Stripe Elements.
 * Must be rendered inside <Elements> wrapper with clientSecret.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentMethodFormProps {
  readonly onCancel: () => void;
  readonly onSuccess?: () => void;
}

/**
 * PaymentMethodForm - Stripe Elements form component
 *
 * Uses useStripe() and useElements() hooks to interact with Stripe.
 * Renders PaymentElement for PCI-compliant card collection.
 * Confirms setup with redirect: "if_required" to avoid page navigation.
 *
 * @param onCancel - Callback when user cancels
 * @param onSuccess - Callback when payment method is successfully added
 */
export function PaymentMethodForm({
  onCancel,
  onSuccess,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Elements not ready");
      return;
    }

    setIsSubmitting(true);
    console.log("Starting confirmSetup...");

    try {
      // Confirm setup with Stripe (R-FAN-PM-2.3)
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      console.log("confirmSetup result:", result);

      if (result.error) {
        // Handle error: show destructive toast with error message (R-FAN-PM-7.1)
        console.error("confirmSetup error:", result.error);
        toast.error(result.error.message || "Failed to add payment method");
        setIsSubmitting(false);
      } else {
        // Handle success: show success toast and call onSuccess (R-FAN-PM-7.1)
        toast.success("Payment method added — Your card has been saved.", {
          description: "It may take a few seconds to appear.",
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error confirming setup:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - Stripe hosted UI (R-FAN-PM-2.2) */}
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Security Notice (R-FAN-PM-7.1) */}
      <Card className="p-4 bg-muted/50 border-border/50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your full card details are never stored on our servers. All payment
              information is securely processed by Stripe.
            </p>
          </div>
        </div>
      </Card>

      {/* Footer Buttons */}
      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Save Payment Method
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
