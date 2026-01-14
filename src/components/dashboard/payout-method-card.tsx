"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CreditCard, ExternalLink } from "lucide-react";

interface PayoutMethodCardProps {
  /** Whether Stripe Connect is connected (always false for MVP placeholder) */
  isConnected?: boolean;
}

/**
 * PayoutMethodCard - Stripe Connect status display (placeholder)
 * Requirements: 8.2, 8.3 - Display connected Stripe Connect account status
 * 
 * MVP: Shows "Coming soon" placeholder with disabled "Add Payout Method" button.
 * Future: Will integrate with Stripe Connect for artist payouts.
 */
export function PayoutMethodCard({
  isConnected = false,
}: Readonly<PayoutMethodCardProps>) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Payout Method
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          >
            Coming soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status message */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Stripe Connect Integration
            </p>
            <p className="text-sm text-muted-foreground">
              Connect your Stripe account to receive payouts directly to your bank. 
              This feature is coming soon.
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${
              isConnected 
                ? "bg-green-500" 
                : "bg-muted-foreground/30"
            }`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Not connected"}
            </span>
          </div>
          {isConnected && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" disabled>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Manage
            </Button>
          )}
        </div>

        {/* Add Payout Method button - disabled for MVP */}
        <Button 
          className="w-full" 
          disabled
          variant="outline"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Add Payout Method
        </Button>

        {/* Helper text */}
        <p className="text-xs text-center text-muted-foreground">
          Payouts are processed securely via Stripe
        </p>
      </CardContent>
    </Card>
  );
}
