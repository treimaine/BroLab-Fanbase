"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Email validation schema
const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    ),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export function HeroSection() {
  const submitToWaitlist = useMutation(api.waitlist.submit);
  const posthog = usePostHog();

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: WaitlistFormData) => {
    try {
      const result = await submitToWaitlist({ email: data.email });
      
      if (!result.success) {
        toast.error("Invalid email", {
          description: result.error ?? "Please enter a valid email address.",
        });
        return;
      }
      
      // Track successful waitlist submission
      posthog.capture('waitlist_submit', { location: 'hero' });
      
      if (result.alreadyExists) {
        toast.info("You're already on the list!", {
          description: "We'll notify you when BroLab Fanbase launches.",
        });
      } else {
        toast.success("You're on the list!", {
          description: "We'll notify you when BroLab Fanbase launches.",
        });
      }
      
      form.reset();
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  // Animation variants with proper typing
  // Headline: fade in + slide up (0.5s ease-out)
  const headlineVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Subheadline: fade in + slide up (0.6s ease-out, 0.1s delay)
  const subheadlineVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: "easeOut",
      },
    },
  };

  // CTAs: fade in + slide up (0.7s ease-out, 0.2s delay)
  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  // Hero image: fade in (0.8s ease-out, 0.3s delay)
  const heroImageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient decoration - subtle lavender glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl" />
      </div>

      {/* Container with max-width */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6 lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20">
        {/* Left column: Copy (mobile-first order) */}
        <div className="flex flex-col">
          {/* Main headline */}
          <motion.h1
            className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            variants={headlineVariants}
            initial="hidden"
            animate="visible"
          >
            Fans pay you{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              directly
            </span>.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="mt-4 text-base text-muted-foreground sm:text-lg lg:text-xl"
            variants={subheadlineVariants}
            initial="hidden"
            animate="visible"
          >
            Sell music, merch, and tickets with Stripe Connect payouts. We earn from your subscription—not your sales.
          </motion.p>

          {/* Trust indicators (mobile: before CTA) */}
          <motion.div
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:hidden"
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
          >
            <span>0% platform fee on sales</span>
            <span className="text-border">•</span>
            <span>Automatic payouts</span>
            <span className="text-border">•</span>
            <span>No credit card required</span>
          </motion.div>

          {/* Primary CTA - Email form */}
          <motion.div
            className="mt-6 w-full max-w-md lg:mt-8"
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-3 sm:flex-row sm:gap-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className={cn(
                            "h-12 rounded-full border-border/50 bg-background/80 px-5 text-base backdrop-blur-sm",
                            "focus-visible:ring-2 focus-visible:ring-primary/50",
                            "placeholder:text-muted-foreground/60"
                          )}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-1 text-left" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 min-w-[44px] rounded-full px-6 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Join Beta
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Trust indicators (desktop: after CTA) */}
          <motion.div
            className="mt-6 hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:flex"
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
          >
            <span>0% platform fee on sales</span>
            <span className="text-border">•</span>
            <span>Automatic payouts</span>
            <span className="text-border">•</span>
            <span>No credit card required</span>
          </motion.div>
        </div>

        {/* Right column: Hero image (mobile: below fold) */}
        <motion.div
          className="relative mt-12 lg:mt-0"
          variants={heroImageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Placeholder hero image - gradient card with mockup */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-2xl lg:aspect-[4/3]">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Mockup placeholder - can be replaced with actual image */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border/50 bg-background/80 p-6 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-full bg-primary/20" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-foreground/10" />
                  <div className="h-4 w-1/2 rounded bg-foreground/10" />
                </div>
                <div className="h-10 w-full rounded-full bg-primary/20" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
