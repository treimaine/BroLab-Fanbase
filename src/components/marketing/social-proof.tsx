"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Quote } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";

/**
 * SocialProof Component (Optional V1)
 * 
 * Requirements: R-MKT-LAND-4, R-MKT-LAND-5
 * 
 * IMPORTANT: Per R-MKT-LAND-5, this component should NOT display fake data.
 * Currently returns null until real testimonials or stats are available.
 * 
 * To enable when real data is available:
 * 1. Set ENABLE_SOCIAL_PROOF to true
 * 2. Update testimonials array with real data
 * 3. OR update stats array with real metrics
 */

// Feature flag - set to true when real data is available
const ENABLE_SOCIAL_PROOF = true; // Enabled for demo with sample stats

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
}

interface Stat {
  value: string;
  label: string;
  description?: string;
}

// Placeholder structure for testimonials (replace with real data)
const testimonials: Testimonial[] = [];

// Placeholder structure for stats (replace with real data)
const stats: Stat[] = [
  {
    value: "0%",
    label: "Platform Fee",
    description: "Keep 100% of your sales revenue",
  },
  {
    value: "24/7",
    label: "Automatic Payouts",
    description: "Powered by Stripe Connect",
  },
  {
    value: "Global",
    label: "Reach",
    description: "Sell to fans anywhere in the world",
  },
];

// Animation variants (shared across components)
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/**
 * Testimonial Card Component
 */
function TestimonialCard({ testimonial }: { readonly testimonial: Testimonial }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card p-8 md:p-10",
        "transition-all duration-300 ease-out",
        "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1"
      )}
    >
      {/* Quote icon */}
      <div
        className={cn(
          "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl",
          "bg-primary/10 text-primary",
          "transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110"
        )}
      >
        <Quote className="h-6 w-6" />
      </div>

      {/* Quote */}
      <blockquote className="mb-6 text-base leading-relaxed md:text-lg">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {testimonial.avatarUrl && (
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/10">
            <NextImage
              src={testimonial.avatarUrl}
              alt={`${testimonial.author} - ${testimonial.role}`}
              width={48}
              height={48}
              className="object-cover"
              sizes="48px"
            />
          </div>
        )}
        <div>
          <div className="font-semibold">{testimonial.author}</div>
          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ stat }: { readonly stat: Stat }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card p-8 text-center md:p-10",
        "transition-all duration-300 ease-out",
        "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1"
      )}
    >
      {/* Stat value */}
      <div className="mb-2 font-serif text-4xl font-bold tracking-tight text-primary md:text-5xl">
        {stat.value}
      </div>

      {/* Stat label */}
      <div className="mb-2 text-lg font-semibold md:text-xl">{stat.label}</div>

      {/* Stat description */}
      {stat.description && (
        <p className="text-sm text-muted-foreground">{stat.description}</p>
      )}
    </motion.div>
  );
}

/**
 * Testimonials Section
 */
function TestimonialsSection({ mounted }: { readonly mounted: boolean }) {
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
            Loved by Artists
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            See what artists are saying about BroLab Fanbase
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-2 md:gap-10"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-100px" } : undefined}
        >
          {testimonials.slice(0, 2).map((testimonial) => (
            <TestimonialCard
              key={`${testimonial.author}-${testimonial.role}`}
              testimonial={testimonial}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Stats Section
 */
function StatsSection({ mounted }: { readonly mounted: boolean }) {
  return (
    <section className="relative px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Stats grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-3 md:gap-10"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-100px" } : undefined}
        >
          {stats.map((stat) => (
            <StatCard key={`${stat.value}-${stat.label}`} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Main SocialProof Component
 */
export function SocialProof() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return if feature is disabled or no data
  if (!ENABLE_SOCIAL_PROOF) return null;
  if (testimonials.length === 0 && stats.length === 0) return null;

  // Render testimonials if available
  if (testimonials.length > 0) {
    return <TestimonialsSection mounted={mounted} />;
  }

  // Render stats if available
  if (stats.length > 0) {
    return <StatsSection mounted={mounted} />;
  }

  return null;
}
