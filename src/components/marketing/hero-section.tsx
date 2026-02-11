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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight, Loader2, Play } from "lucide-react";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const submitToWaitlist = useMutation(api.waitlist.submit);
  const posthog = usePostHog();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

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
        toast.error("Invalid email", { description: result.error });
        return;
      }
      posthog.capture('waitlist_submit', { location: 'hero' });
      if (result.alreadyExists) {
        toast.info("You're already on the list!");
      } else {
        toast.success("You're on the list!");
      }
      form.reset();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300"
    >
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute -right-[10%] bottom-[10%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[100px]" 
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 lg:pt-48">
        <div className="flex flex-col items-center text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Beta Access Now Open
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="max-w-4xl font-serif text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-7xl lg:text-8xl"
          >
            Direct access to your{" "}
            <span className="italic text-primary">truest</span> fans.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Stop fighting algorithms. Own your audience, sell your work, and get paid instantly. All in one beautiful link.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mt-10 flex w-full max-w-md flex-col gap-4"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-3 sm:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          id="hero-email-input"
                          placeholder="your@email.com"
                          className="h-14 rounded-2xl border-border bg-card/50 px-6 text-lg text-foreground placeholder:text-muted-foreground/50 backdrop-blur-xl focus:border-primary/50 focus:ring-0 focus:ring-offset-0"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="group h-14 rounded-2xl px-8 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Join as an Artist (Beta)
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <p className="text-sm text-muted-foreground">Join 50+ artists taking back control.</p>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative mt-20 perspective-1000"
        >
          <div className="group relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-border bg-card/50 p-4 backdrop-blur-3xl lg:p-6 shadow-2xl shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] sm:aspect-video lg:aspect-[21/9]">
              <Image
                src="/hero-visual.png"
                alt="Artist Dashboard Interface"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-12 top-1/4 h-32 w-32 rounded-3xl border border-border bg-card/50 p-4 backdrop-blur-2xl lg:block hidden shadow-lg"
          >
            <div className="h-full w-full rounded-2xl bg-primary/20" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 bottom-1/4 h-40 w-40 rounded-[2.5rem] border border-border bg-card/50 p-4 backdrop-blur-2xl lg:block hidden shadow-lg"
          >
            <div className="h-full w-full rounded-3xl bg-purple-500/10" />
          </motion.div>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="mt-20 border-t border-border pb-20 pt-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Powered by industry standards
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            <span className="text-xl font-bold text-foreground">Stripe</span>
            <span className="text-xl font-bold text-foreground">Clerk</span>
            <span className="text-xl font-bold text-foreground">Convex</span>
            <span className="text-xl font-bold text-foreground">Next.js</span>
            <span className="text-xl font-bold text-foreground">PostHog</span>
          </div>
        </div>
      </div>
    </section>
  );
}
