"use client";

/**
 * Fan Billing Page
 * Requirements: 11.1-11.5 - Payment methods and billing history management
 * Requirements: R-FAN-PM-3.1, R-FAN-PM-7.2, R-FAN-PM-7.3 - Real data from Convex
 * 
 * Displays fan's billing information with:
 * - Tabs: Payment Methods / Billing History
 * - Payment methods management (add/remove cards)
 * - Transaction history
 * - Security notice about Stripe-secured payments
 * 
 * Connected to Stripe via Convex with real data
 */

import { api } from "@/../convex/_generated/api";
import { AddPaymentMethodDialog } from "@/components/fan/add-payment-method-dialog";
import { BillingHistoryTab, type TransactionData } from "@/components/fan/billing-history-tab";
import { PaymentMethodsTab, type PaymentMethodData } from "@/components/fan/payment-methods-tab";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction, useQuery } from "convex/react";
import { Shield } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  // Convex query for payment methods (deterministic read model)
  // Requirements: R-FAN-PM-3.1 - Read from Convex table (webhook-synced)
  const paymentMethodsData = useQuery(api.paymentMethods.listForCurrentUser);

  // Convex query for purchase history (real orders data)
  // Requirements: R-PROD-0.1, R-PROD-0.2 - No mock data on user-facing pages
  const purchasesData = useQuery(api.orders.getMyPurchases);

  // State for busy actions (individual loading states)
  // Requirements: R-FAN-PM-7.3 - Show loading state during actions
  const [busyId, setBusyId] = useState<string | null>(null);

  // State for Add Payment Method dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);

  // Convex actions
  const createSetupIntent = useAction(api.stripe.createSetupIntent);
  const setDefaultPaymentMethod = useAction(api.stripe.setDefaultPaymentMethod);
  const detachPaymentMethod = useAction(api.stripe.detachPaymentMethod);

  // Transform purchases data to transactions format
  // Requirements: R-PROD-0.1 - Display real data from Convex
  const transactions: TransactionData[] = useMemo(() => {
    if (!purchasesData) return [];

    return purchasesData.flatMap((purchase) => {
      const { order, items } = purchase;

      // Create a transaction for each order
      // For now, we'll create one transaction per order with all items combined
      // In the future, we could create separate transactions per item
      if (items.length === 0) return [];

      // Get the first item for description (or combine multiple items)
      const description =
        items.length === 1
          ? `${items[0].product.title} - ${items[0].artist.displayName}`
          : `${items.length} items from ${items[0].artist.displayName}`;

      return [
        {
          id: order._id,
          type: "purchase" as const,
          description,
          amount: order.totalUSD,
          currency: order.currency,
          date: order.createdAt,
          status: order.status === "paid" ? ("completed" as const) : ("pending" as const),
        },
      ];
    });
  }, [purchasesData]);

  // Handle add payment method
  // Requirements: R-FAN-PM-2.1, R-FAN-PM-2.2 - Create SetupIntent and show dialog
  const handleAddPaymentMethod = useCallback(async () => {
    try {
      // Create a Stripe Setup Intent
      const result = await createSetupIntent();
      
      // Open dialog with clientSecret
      setSetupClientSecret(result.clientSecret);
      setIsAddDialogOpen(true);
    } catch (error) {
      console.error("Create setup intent error:", error);
      toast.error("Failed to initialize payment method setup. Please try again.");
    }
  }, [createSetupIntent]);

  // Handle set default payment method
  // Requirements: R-FAN-PM-5.1, R-FAN-PM-5.2 - Set default via Stripe API
  const handleSetDefaultPaymentMethod = useCallback(async (methodId: string) => {
    try {
      setBusyId(methodId);
      
      await setDefaultPaymentMethod({ stripePaymentMethodId: methodId });
      
      toast.success("Default payment method updated");
    } catch (error) {
      console.error("Set default payment method error:", error);
      toast.error("Failed to set default payment method. Please try again.");
    } finally {
      setBusyId(null);
    }
  }, [setDefaultPaymentMethod]);

  // Handle remove payment method
  // Requirements: R-FAN-PM-6.1, R-FAN-PM-6.2 - Remove via Stripe API
  const handleRemovePaymentMethod = useCallback(async (methodId: string) => {
    try {
      setBusyId(methodId);
      
      await detachPaymentMethod({ stripePaymentMethodId: methodId });
      
      toast.success("Payment method removed successfully");
    } catch (error) {
      console.error("Remove payment method error:", error);
      toast.error("Failed to remove payment method. Please try again.");
    } finally {
      setBusyId(null);
    }
  }, [detachPaymentMethod]);

  // Handle dialog success
  // Requirements: R-FAN-PM-7.1, R-FAN-PM-7.2 - Show success toast and auto-update
  const handleDialogSuccess = useCallback(() => {
    toast.success("Payment method added — syncing…", {
      description: "It may take a few seconds to appear.",
    });
    setIsAddDialogOpen(false);
    setSetupClientSecret(null);
  }, []);

  // Handle dialog close
  const handleDialogClose = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setSetupClientSecret(null);
    }
  }, []);

  // Transform Convex payment methods to component format
  const paymentMethods: PaymentMethodData[] = paymentMethodsData?.map((pm) => ({
    id: pm.stripePaymentMethodId,
    brand: pm.brand as PaymentMethodData["brand"],
    last4: pm.last4,
    expiryMonth: pm.expMonth,
    expiryYear: pm.expYear,
    isDefault: pm.isDefault,
  })) ?? [];

  // Loading states
  const isLoadingPaymentMethods = paymentMethodsData === undefined;
  const isLoadingTransactions = purchasesData === undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and view transaction history
          </p>
        </div>

        {/* Security Notice - Top Level */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Secure Payments by Stripe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All payment information is securely stored and processed by Stripe, 
                a PCI-compliant payment processor trusted by millions of businesses worldwide. 
                We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs: Payment Methods / Billing History */}
        <Tabs defaultValue="payment-methods" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="mt-0">
            <PaymentMethodsTab
              paymentMethods={paymentMethods}
              onAddPaymentMethod={handleAddPaymentMethod}
              onRemovePaymentMethod={handleRemovePaymentMethod}
              onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
              isLoading={isLoadingPaymentMethods}
              isRemoving={busyId}
            />
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing-history" className="mt-0">
            <BillingHistoryTab
              transactions={transactions}
              isLoading={isLoadingTransactions}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        clientSecret={setupClientSecret}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
