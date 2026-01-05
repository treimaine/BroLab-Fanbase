"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
    Calendar,
    CreditCard,
    Home,
    LayoutDashboard,
    Link as LinkIcon,
    LogOut,
    Music,
    ShoppingBag,
    User,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarProps {
  role: UserRole;
  user: {
    name: string;
    avatar?: string;
    username: string;
  };
  onSignOut?: () => void;
}

// Navigation items for fan role
const getFanNavItems = (username: string): NavItem[] => [
  { href: `/me/${username}`, icon: Home, label: "Feed" },
  { href: `/me/${username}/purchases`, icon: ShoppingBag, label: "Purchases" },
  { href: `/me/${username}/billing`, icon: CreditCard, label: "Billing" },
];

// Navigation items for artist role
const artistNavItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/profile", icon: User, label: "Profile & Bio" },
  { href: "/dashboard/links", icon: LinkIcon, label: "Links" },
  { href: "/dashboard/events", icon: Calendar, label: "Events" },
  { href: "/dashboard/products", icon: Music, label: "Products" },
  { href: "/dashboard/billing", icon: Wallet, label: "Billing" },
];

export function Sidebar({ role, user, onSignOut }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const navItems = role === "fan" ? getFanNavItems(user.username) : artistNavItems;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 border-r border-border/50 bg-background">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-semibold text-foreground">
            BroLab Fanbase
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between rounded-xl px-3 py-2">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl p-3 bg-muted/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className="w-full mt-2 justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
