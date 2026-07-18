"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

interface Stat {
  value: string;
  label: string;
  description: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I replaced 3 tools with BroLab. My fans buy merch, stream exclusives, and connect — all from one link.",
    author: "Elara Vance",
    role: "Independent Artist, 12K+ fans",
    initials: "EV",
  },
  {
    quote:
      "Stripe payouts hit my account the same day. No more waiting 30 days for platforms to release my money.",
    author: "Marcus Cole",
    role: "Producer & DJ",
    initials: "MC",
  },
  {
    quote:
      "Setup took me 4 minutes. I was live before my coffee got cold. The simplicity is unreal.",
    author: "Sana Mirza",
    role: "Singer-Songwriter",
    initials: "SM",
  },
];

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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function SocialProof() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-background px-4 py-32 md:px-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          variants={mounted ? fadeInUp : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-80px" } : undefined}
        >
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Artists{" "}
            <span className="italic text-primary">love it.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Don&apos;t take our word for it — hear from early access artists already using BroLab.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-3 mb-20"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-80px" } : undefined}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={cardVariants}
              className={cn(
                "group relative flex flex-col justify-between rounded-[2rem] border border-border bg-card/50 p-8 md:p-10",
                "transition-all duration-300 ease-out",
                "hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
              )}
            >
              <div>
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Quote className="h-5 w-5" />
                </div>
                <blockquote className="text-base leading-relaxed text-foreground/90 md:text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-border/50 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={mounted ? containerVariants : undefined}
          initial={mounted ? "hidden" : false}
          whileInView={mounted ? "visible" : undefined}
          viewport={mounted ? { once: true, margin: "-80px" } : undefined}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className={cn(
                "group rounded-[2rem] border border-border bg-card/50 p-8 text-center md:p-10",
                "transition-all duration-300 ease-out",
                "hover:border-primary/20 hover:bg-card hover:shadow-lg"
              )}
            >
              <p className="font-serif text-4xl font-black tracking-tight text-primary md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">{stat.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
