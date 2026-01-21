"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Sign up in 60 seconds",
    description: "Choose your unique link and create your hub.",
  },
  {
    number: 2,
    title: "Connect Stripe",
    description: "Set up automatic payouts to your bank account.",
  },
  {
    number: 3,
    title: "Share your link",
    description: "Post on Instagram, YouTube, or anywhere fans find you.",
  },
];

export function HowItWorks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Header animation - fade in + slide up
  const headerVariants: Variants = {
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

  // Container animation - stagger children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  // Step card animation - fade in + slide up
  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center md:mb-16"
          variants={mounted ? headerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-100px" } : undefined}
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Get started in minutes, not days
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-100px" } : undefined}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              variants={stepVariants}
            >
              {/* Card */}
              <div
                className={cn(
                  "group relative h-full rounded-2xl border border-border/50 bg-card p-8 md:p-10",
                  "transition-all duration-300 ease-out",
                  "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
                  "hover:-translate-y-1"
                )}
              >
                {/* Number badge - Circle with lavender gradient */}
                <div
                  className={cn(
                    "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-primary via-primary/90 to-primary/70",
                    "text-xl font-bold text-white shadow-lg shadow-primary/20",
                    "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30"
                  )}
                >
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="mb-3 font-serif text-xl font-semibold tracking-tight md:text-2xl">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block lg:-right-6">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
