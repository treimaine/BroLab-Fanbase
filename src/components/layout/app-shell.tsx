"use client";

import type { UserRole } from "@/types";
import { useState } from "react";
import { BottomNav } from "./bottom-nav";
import { MobileDrawer } from "./mobile-drawer";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  user: {
    name: string;
    avatar?: string;
    username: string;
  };
  onSignOut?: () => void;
}

/**
 * AppShell - Main layout component for authenticated pages
 * 
 * Responsive behavior:
 * - Desktop (>= lg): Sidebar + main content
 * - Mobile (< lg): TopBar + main content + BottomNav
 * 
 * Requirements: 12.1, 12.2, 12.4
 */
export function AppShell({
  children,
  role,
  user,
  onSignOut,
}: Readonly<AppShellProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile, visible on lg+ */}
      <Sidebar role={role} user={user} onSignOut={onSignOut} />

      {/* Mobile TopBar - visible on mobile, hidden on lg+ */}
      <TopBar
        showBurger
        onBurgerClick={() => setDrawerOpen(true)}
        actions={<ThemeToggle />}
      />

      {/* Mobile Drawer (Sheet) */}
      <MobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role={role}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - visible on mobile, hidden on lg+ */}
      <BottomNav role={role} username={user.username} />
    </div>
  );
}
