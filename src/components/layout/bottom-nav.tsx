"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
    Calendar,
    CreditCard,
    Home,
    LayoutDashboard,
    Music,
    ShoppingBag,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface BottomNavProps {
  role: UserRole;
  username?: string;
}

// Navigation items for fan role (4 items)
const getFanNavItems = (username: string): NavItem[] => [
  { href: `/me/${username}`, icon: Home, label: "Feed" },
  { href: `/me/${username}/purchases`, icon: ShoppingBag, label: "Purchases" },
  { href: `/me/${username}/billing`, icon: CreditCard, label: "Billing" },
];

// Navigation items for artist role (5 items - most important ones)
const artistNavItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/events", icon: Calendar, label: "Events" },
  { href: "/dashboard/products", icon: Music, label: "Products" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export function BottomNav({ role, username = "" }: Readonly<BottomNavProps>) {
  const pathname = usePathname();
  const navItems = role === "fan" ? getFanNavItems(username) : artistNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== `/me/${username}` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[60px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
