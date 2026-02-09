/**
 * Artist Billing Manage Page
 * Requirements: R-ART-SUB-2.1, R-ART-SUB-2.2
 *
 * This page renders the Clerk Billing subscription management UI
 * using the <SubscriptionDetailsButton /> component.
 *
 * Features:
 * - View current subscription details
 * - Update payment method
 * - Cancel subscription
 * - Reactivate canceled subscription
 * - View billing history
 *
 * Flow:
 * 1. User clicks "Manage Subscription" on billing page
 * 2. Redirected to /api/billing/manage (validates auth + role)
 * 3. API redirects here to /dashboard/billing/manage
 * 4. This page renders Clerk's subscription management UI
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionDetailsButton } from "@clerk/nextjs/experimental";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManageSubscriptionPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/billing")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Billing
      </Button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your subscription details, payment methods, and billing history.
        </p>
      </div>

      {/* Subscription management card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Manage your subscription, update payment methods, or cancel your plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Clerk Billing subscription management UI */}
          <SubscriptionDetailsButton
            for="user"
            onSubscriptionCancel={() => {
              // Redirect back to billing page after cancellation
              router.push("/dashboard/billing");
            }}
          >
            <Button className="w-full">Open Subscription Manager</Button>
          </SubscriptionDetailsButton>
        </CardContent>
      </Card>
    </div>
  );
}
