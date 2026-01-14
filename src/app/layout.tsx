import { ThemeProvider } from "@/components/layout/theme-provider";
import { GlobalPlayerProvider } from "@/components/player";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { UserSyncProvider } from "@/components/providers/user-sync-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${playfair.variable} font-sans`}>
          <ConvexClientProvider>
            <ThemeProvider>
              <UserSyncProvider>
                <GlobalPlayerProvider>
                  {children}
                </GlobalPlayerProvider>
              </UserSyncProvider>
              <Toaster />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
