"use client";

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

export function BillingContent() {
  const paymentMethodsData = useQuery(api.paymentMethods.listForCurrentUser);
  const purchasesData = useQuery(api.orders.getMyPurchases);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);

  const createSetupIntent = useAction(api.stripe.createSetupIntent);
  const setDefaultPaymentMethod = useAction(api.stripe.setDefaultPaymentMethod);
  const detachPaymentMethod = useAction(api.stripe.detachPaymentMethod);

  const transactions: TransactionData[] = useMemo(() => {
    if (!purchasesData) return [];

    return purchasesData.flatMap((purchase) => {
      const { order, items } = purchase;

      if (items.length === 0) return [];

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

  const handleAddPaymentMethod = useCallback(async () => {
    try {
      const result = await createSetupIntent();
      
      setSetupClientSecret(result.clientSecret);
      setIsAddDialogOpen(true);
    } catch (error) {
      console.error("Create setup intent error:", error);
      toast.error("Failed to initialize payment method setup. Please try again.");
    }
  }, [createSetupIntent]);

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

  const handleDialogSuccess = useCallback(() => {
    toast.success("Payment method added — syncing…", {
      description: "It may take a few seconds to appear.",
    });
    setIsAddDialogOpen(false);
    setSetupClientSecret(null);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setSetupClientSecret(null);
    }
  }, []);

  const paymentMethods: PaymentMethodData[] = paymentMethodsData?.map((pm) => ({
    id: pm.stripePaymentMethodId,
    brand: pm.brand as PaymentMethodData["brand"],
    last4: pm.last4,
    expiryMonth: pm.expMonth,
    expiryYear: pm.expYear,
    isDefault: pm.isDefault,
  })) ?? [];

  const isLoadingPaymentMethods = paymentMethodsData === undefined;
  const isLoadingTransactions = purchasesData === undefined;

  return (
    <>
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

      <Tabs defaultValue="payment-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>

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

        <TabsContent value="billing-history" className="mt-0">
          <BillingHistoryTab
            transactions={transactions}
            isLoading={isLoadingTransactions}
          />
        </TabsContent>
      </Tabs>

      <AddPaymentMethodDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        clientSecret={setupClientSecret}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
