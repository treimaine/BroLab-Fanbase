/**
 * Subscription Badge Component
 * Requirements: R-CLERK-SUB-1.1, R-CLERK-SUB-1.2
 * 
 * Displays current subscription plan and usage limits.
 * Example component showing how to use subscription queries.
 */

"use client";

import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";

export function SubscriptionBadge() {
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);
  const usage = useQuery(api.subscriptions.getCurrentUsage);

  if (!subscription) {
    return null;
  }

  const planColors = {
    free: "bg-gray-500",
    premium: "bg-purple-500",
  };

  const planColor = planColors[subscription.plan];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription</CardTitle>
          <Badge className={planColor}>
            {subscription.plan.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          {subscription.status === "active" && "Your subscription is active"}
          {subscription.status === "trialing" && "You're on a trial"}
          {subscription.status === "none" && "Free plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usage && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Products</span>
              <span>
                {usage.productsCount} / {subscription.limits.maxProducts}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Events</span>
              <span>
                {usage.eventsCount} / {subscription.limits.maxEvents}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Custom Links</span>
              <span>
                {usage.linksCount} / {subscription.limits.maxLinks}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Video Uploads</span>
              <span>
                {subscription.limits.canUploadVideo ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        )}

        {subscription.plan === "free" && (
          <Button className="w-full" variant="default">
            Upgrade to Premium - $19.99/month
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
