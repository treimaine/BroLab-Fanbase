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
import { ArrowRight, Loader2, Play } from "lucide-react";
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
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOut cubic bezier
      },
    },
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20 md:px-6 md:py-32">
      {/* Background gradient decoration - subtle lavender glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main headline */}
        <motion.h1
          className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
          variants={itemVariants}
        >
          Your career isn&apos;t an{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            algorithm
          </span>.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          className="mt-6 max-w-xl text-lg text-muted-foreground md:mt-8 md:text-xl"
          variants={itemVariants}
        >
          Build your hub. Connect with fans. Own your revenue.
        </motion.p>

        {/* Email form */}
        <motion.div
          className="mt-10 w-full max-w-md md:mt-12"
          variants={itemVariants}
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
                className="h-12 rounded-full px-6 font-medium"
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

        {/* Secondary info line */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
          variants={itemVariants}
        >
          <button
            type="button"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            onClick={() => {
              toast.info("Demo coming soon!", {
                description:
                  "We're putting the finishing touches on our demo video.",
              });
            }}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Watch 30s demo</span>
          </button>
          <span className="hidden text-border sm:inline">•</span>
          <span>No credit card required</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
