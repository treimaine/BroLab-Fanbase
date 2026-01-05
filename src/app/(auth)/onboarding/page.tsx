"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Heart, Loader2, Mic2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Role = "artist" | "fan";

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // If user already has a role, redirect them
  if (isLoaded && user?.publicMetadata?.role) {
    const role = user.publicMetadata.role as Role;
    if (role === "artist") {
      router.replace("/dashboard");
    } else {
      router.replace(`/me/${user.username || user.id}`);
    }
    return null;
  }

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set role");
      }

      toast.success(
        `Welcome to BroLab Fanbase as ${selectedRole === "artist" ? "an Artist" : "a Fan"}!`
      );

      // Redirect based on role
      if (selectedRole === "artist") {
        router.push("/dashboard");
      } else {
        router.push(`/me/${user.username || user.id}`);
      }
    } catch (error) {
      console.error("Error setting role:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
            How will you use BroLab?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Choose your role to personalize your experience
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Artist Card */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50",
              "rounded-2xl border-2",
              selectedRole === "artist"
                ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                : "border-border hover:bg-accent/30"
            )}
            onClick={() => setSelectedRole("artist")}
          >
            <CardHeader className="text-center pb-2">
              <div
                className={cn(
                  "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                  selectedRole === "artist"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                <Mic2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-serif">Artist</CardTitle>
              <CardDescription className="text-sm">
                Create your hub and connect with fans
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Build your personal hub page</li>
                <li>• Sell music, videos & tickets</li>
                <li>• Manage events & tours</li>
                <li>• Track your revenue</li>
              </ul>
            </CardContent>
          </Card>

          {/* Fan Card */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50",
              "rounded-2xl border-2",
              selectedRole === "fan"
                ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                : "border-border hover:bg-accent/30"
            )}
            onClick={() => setSelectedRole("fan")}
          >
            <CardHeader className="text-center pb-2">
              <div
                className={cn(
                  "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                  selectedRole === "fan"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                <Heart className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-serif">Fan</CardTitle>
              <CardDescription className="text-sm">
                Follow artists and never miss a beat
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Follow your favorite artists</li>
                <li>• Get personalized feed updates</li>
                <li>• Purchase exclusive content</li>
                <li>• Manage your collection</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="min-w-[200px] rounded-full font-medium"
            disabled={!selectedRole || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
