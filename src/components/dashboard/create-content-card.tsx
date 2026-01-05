"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Link2, Music, Plus } from "lucide-react";
import Link from "next/link";

interface CreateContentCardProps {
  className?: string;
}

/**
 * CreateContentCard - Quick actions card for creating content
 * Requirements: 4.3 - "Add Link" + "Add Event" actions
 * 
 * Provides quick access buttons to create new content (links, events, products).
 */
export function CreateContentCard({ className }: Readonly<CreateContentCardProps>) {
  const actions = [
    {
      label: "Add Link",
      href: "/dashboard/links",
      icon: Link2,
      description: "Add external links",
    },
    {
      label: "Add Event",
      href: "/dashboard/events",
      icon: Calendar,
      description: "Create a new event",
    },
    {
      label: "Add Product",
      href: "/dashboard/products",
      icon: Music,
      description: "Upload music or video",
    },
  ];

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Content
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-muted/50"
              >
                <div className="p-1.5 rounded-md bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
