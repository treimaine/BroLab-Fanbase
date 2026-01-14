"use client";

/**
 * Fan Billing Page
 * Requirements: 11.1-11.5 - Payment methods and billing history management
 * 
 * Displays fan's billing information with:
 * - Tabs: Payment Methods / Billing History
 * - Payment methods management (add/remove cards)
 * - Transaction history
 * - Security notice about Stripe-secured payments
 * 
 * Connected to Stripe via Convex (future implementation)
 */

import { api } from "@/../convex/_generated/api";
import { BillingHistoryTab, type TransactionData } from "@/components/fan/billing-history-tab";
import { PaymentMethodsTab, type PaymentMethodData } from "@/components/fan/payment-methods-tab";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "convex/react";
import { Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Mock data for MVP - will be replaced with Convex queries
 */
const MOCK_PAYMENT_METHODS: PaymentMethodData[] = [
  {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: "pm_2",
    brand: "mastercard",
    last4: "5555",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
];

const MOCK_TRANSACTIONS: TransactionData[] = [
  {
    id: "txn_1",
    type: "purchase",
    description: "Album: Midnight Dreams - DJ Nova",
    amount: 9.99,
    currency: "usd",
    date: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    status: "completed",
  },
  {
    id: "txn_2",
    type: "purchase",
    description: "Event Ticket: Summer Festival 2024",
    amount: 45,
    currency: "usd",
    date: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    status: "completed",
  },
  {
    id: "txn_3",
    type: "refund",
    description: "Refund: Cancelled Event Ticket",
    amount: 30,
    currency: "usd",
    date: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
    status: "completed",
  },
  {
    id: "txn_4",
    type: "purchase",
    description: "Video: Behind the Scenes - Treigua",
    amount: 4.99,
    currency: "usd",
    date: Date.now() - 1000 * 60 * 60 * 24 * 14, // 2 weeks ago
    status: "completed",
  },
];

export default function BillingPage() {
  // State for mock data (will be replaced with Convex queries)
  const [paymentMethods] = useState<PaymentMethodData[]>(MOCK_PAYMENT_METHODS);
  const [transactions] = useState<TransactionData[]>(MOCK_TRANSACTIONS);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Convex actions (not mutations, because they're defined as actions)
  const createSetupIntent = useAction(api.stripe.createSetupIntent);
  const removePaymentMethodAction = useAction(api.stripe.removePaymentMethod);

  // Handle add payment method
  // Requirements: 11.2 - Add payment method via Stripe Setup Intent
  const handleAddPaymentMethod = useCallback(async () => {
    try {
      // Create a Stripe Setup Intent
      const result = await createSetupIntent();
      
      // In production, you would:
      // 1. Use the clientSecret to initialize Stripe Elements
      // 2. Show a payment method form modal
      // 3. Confirm the setup intent
      // 4. Refresh the payment methods list
      
      console.log("Setup Intent created:", result);
      toast.info("Payment method setup - Stripe integration coming soon!");
    } catch (error) {
      console.error("Create setup intent error:", error);
      toast.error("Failed to initialize payment method setup. Please try again.");
    }
  }, [createSetupIntent]);

  // Handle remove payment method
  // Requirements: 11.3 - Remove payment method via Stripe API
  const handleRemovePaymentMethod = useCallback(async (methodId: string) => {
    try {
      setIsRemoving(methodId);
      
      // Remove payment method via Convex action (calls Stripe API)
      const result = await removePaymentMethodAction({ paymentMethodId: methodId });
      
      console.log("Payment method removed:", result);
      toast.success("Payment method removed successfully");
      
      // In production, you would refresh the payment methods list here
    } catch (error) {
      console.error("Remove payment method error:", error);
      toast.error("Failed to remove payment method. Please try again.");
    } finally {
      setIsRemoving(null);
    }
  }, [removePaymentMethodAction]);

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
              isLoading={false}
              isRemoving={isRemoving}
            />
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing-history" className="mt-0">
            <BillingHistoryTab
              transactions={transactions}
              isLoading={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
