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
    <section className="relative px-4 py-20 md:px-6 md:py-32">
      <motion.div
        className="mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                "group relative rounded-2xl border border-border/50 bg-card p-8 md:p-10",
                "transition-all duration-300 ease-out",
                "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
                "hover:-translate-y-1"
              )}
            >
              {/* Icon container */}
              <div
                className={cn(
                  "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl",
                  "bg-primary/10 text-primary",
                  "transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110"
                )}
              >
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Title */}
              <h3 className="mb-3 font-serif text-xl font-semibold tracking-tight md:text-2xl">
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
