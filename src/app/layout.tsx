import { ThemeProvider } from "@/components/layout/theme-provider";
import { GlobalPlayerProvider } from "@/components/player";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { PHProvider } from "@/components/providers/posthog-provider";
import { UserSyncProvider } from "@/components/providers/user-sync-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Import diagnostics in development only
if (process.env.NODE_ENV === 'development') {
  import("@/lib/production-diagnostics");
}

// Dynamic import for ClerkDebug in development only
const ClerkDebug = process.env.NODE_ENV === 'development' 
  ? require("@/components/debug/clerk-debug").ClerkDebug 
  : () => null;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "BroLab Fanbase",
  description: "Your career isn't an algorithm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            elements: {
              formFieldInput: "dark:text-white dark:placeholder:text-gray-400",
            },
          }}
          afterSignOutUrl="/"
          signInFallbackRedirectUrl="/onboarding"
          signUpFallbackRedirectUrl="/onboarding"
          telemetry={process.env.NODE_ENV === 'development' ? false : undefined}
        >
          <PHProvider>
            <ConvexClientProvider>
              <ThemeProvider>
                <UserSyncProvider>
                  <GlobalPlayerProvider>
                    {children}
                  </GlobalPlayerProvider>
                </UserSyncProvider>
                <Toaster />
                <ClerkDebug />
              </ThemeProvider>
            </ConvexClientProvider>
          </PHProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
