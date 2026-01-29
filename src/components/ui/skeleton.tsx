import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton };

// Re-export specialized skeletons
export { DashboardSkeleton } from "./dashboard-skeleton";
export { ErrorBoundary } from "./error-boundary";
export { FeedSkeleton } from "./feed-skeleton";
export { HubSkeleton } from "./hub-skeleton";
export { SuspenseWrapper } from "./suspense-wrapper";

