"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Music, ShoppingBag, Ticket } from "lucide-react";
import { useEffect, useState } from "react";

interface UseCase {
  icon: React.ElementType;
  title: string;
  description: string;
  benefit: string;
}

const useCases: UseCase[] = [
  {
    icon: Music,
    title: "Music",
    description: "Sell tracks, albums, and exclusive releases",
    benefit: "Fans download instantly after purchase",
  },
  {
    icon: ShoppingBag,
    title: "Merch",
    description: "Sell physical goods with custom links",
    benefit: "Manage orders and fulfillment your way",
  },
  {
    icon: Ticket,
    title: "Tickets",
    description: "Sell event access and tour tickets",
    benefit: "Fans get instant confirmation",
  },
];

export function UseCases() {
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
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Card animation - fade in + slide up
  const cardVariants: Variants = {
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
            What You Can Sell
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Everything your fans want, all in one place
          </p>
        </motion.div>

        {/* Use cases grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-3 md:gap-10"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-100px" } : undefined}
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={cardVariants}
              className={cn(
                "group relative cursor-pointer rounded-2xl border border-border/50 p-8 md:p-10",
                "bg-white/80 dark:bg-black/80 backdrop-blur-sm",
                "transition-all duration-300 ease-out",
                "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
                "hover:-translate-y-1"
              )}
            >
              {/* Icon container - 48px with lavender accent */}
              <div
                className={cn(
                  "mb-6 inline-flex items-center justify-center",
                  "text-primary",
                  "transition-all duration-300 group-hover:scale-110"
                )}
              >
                <useCase.icon className="h-12 w-12" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="mb-3 font-serif text-xl font-semibold tracking-tight md:text-2xl">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="mb-3 text-sm leading-relaxed text-foreground md:text-base">
                {useCase.description}
              </p>

              {/* Benefit - muted text */}
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {useCase.benefit}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
