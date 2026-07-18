"use client";

import { GlassCard, GradientBackdrop, Reveal, Section } from "@/components/ds";
import { cardReveal, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, Rocket, Zap } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  stat: string;
  statLabel: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "Direct Access",
    description:
      "Connect with your fans without the interference of algorithms. Your content, their feed, zero friction.",
    gradient: "from-amber-400 to-orange-500",
    stat: "0%",
    statLabel: "Platform interference",
  },
  {
    icon: Rocket,
    title: "Instant Payouts",
    description:
      "Sell music, merch, and tickets worldwide. Get paid directly to your bank account via Stripe Connect.",
    gradient: "from-primary to-blue-500",
    stat: "~2s",
    statLabel: "Average payout speed",
  },
  {
    icon: Eye,
    title: "Full Ownership",
    description:
      "You own your data, your audience, and your revenue. No platform lock-in, ever. Build your empire.",
    gradient: "from-purple-500 to-pink-500",
    stat: "100%",
    statLabel: "Your data, your revenue",
  },
];

const MotionGlassCard = motion.create(GlassCard);

export function FeatureGrid() {
  return (
    <Section backdrop={<GradientBackdrop />}>
      <Reveal
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-3"
      >
        {features.map((feature) => (
          <MotionGlassCard
            key={feature.title}
            variants={cardReveal}
            className="group flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
                <feature.icon className="h-8 w-8" />
              </div>

              <h3 className="mb-4 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {feature.title}
              </h3>

              <p className="text-lg leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>

            <div className="mt-10 flex items-end justify-between border-t border-border/50 pt-6">
              <div>
                <p className={cn("bg-gradient-to-r bg-clip-text font-serif text-4xl font-black text-transparent", feature.gradient)}>
                  {feature.stat}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {feature.statLabel}
                </p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br opacity-20 transition-opacity group-hover:opacity-60", feature.gradient)}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </MotionGlassCard>
        ))}
      </Reveal>
    </Section>
  );
}
