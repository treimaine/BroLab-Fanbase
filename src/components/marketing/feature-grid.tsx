"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Globe, Heart, Shield } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Heart,
    title: "Direct to Fan",
    description:
      "Build genuine connections with your audience. No middlemen, no algorithms—just you and your fans.",
  },
  {
    icon: Globe,
    title: "Global Commerce",
    description:
      "Sell music, merch, and tickets worldwide. Accept payments in any currency, reach fans everywhere.",
  },
  {
    icon: Shield,
    title: "Own Your Data",
    description:
      "Your fans, your insights, your revenue. Full control over your career without platform lock-in.",
  },
];

export function FeatureGrid() {
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
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24">
      <motion.div
        className="mx-auto max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                "group relative rounded-2xl border border-border/50 bg-card p-6 md:p-8",
                "transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              {/* Icon container */}
              <div
                className={cn(
                  "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                  "bg-primary/10 text-primary",
                  "transition-colors duration-300 group-hover:bg-primary/15"
                )}
              >
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="mb-2 font-serif text-xl font-semibold tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
