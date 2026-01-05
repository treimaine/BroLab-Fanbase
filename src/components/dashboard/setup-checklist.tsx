"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

interface SetupChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

/**
 * SetupChecklist - Dashboard setup progress checklist
 * Requirements: 4.2 - Setup checklist with links to sections
 * 
 * Shows a list of setup steps with completion status and navigation links.
 */
export function SetupChecklist({ items, className }: Readonly<SetupChecklistProps>) {
  const completedCount = items.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Setup Progress</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length} complete
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  "hover:bg-muted/50",
                  item.completed && "opacity-60"
                )}
              >
                {item.completed ? (
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                ) : (
                  <Circle className="flex-shrink-0 h-5 w-5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    item.completed && "line-through text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
