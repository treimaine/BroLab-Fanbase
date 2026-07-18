"use client";

import { GlassCard, Highlight, Reveal, Section, SectionHeading } from "@/components/ds";
import { cardReveal, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

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

const MotionGlassCard = motion.create(GlassCard);

export function SocialProof() {
  return (
    <Section>
      <SectionHeading
        title={<>Artists <Highlight>love it.</Highlight></>}
        subtitle="Don't take our word for it — hear from early access artists already using BroLab."
      />

      {/* Testimonials Grid */}
      <Reveal
        variants={staggerContainer}
        className="mb-20 grid gap-6 md:grid-cols-3"
      >
        {testimonials.map((testimonial) => (
          <MotionGlassCard
            key={testimonial.author}
            variants={cardReveal}
            className="group flex flex-col justify-between"
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
          </MotionGlassCard>
        ))}
      </Reveal>

      {/* Stats Row */}
      <Reveal variants={staggerContainer} className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <MotionGlassCard
            key={stat.label}
            variants={cardReveal}
            className="text-center"
          >
            <p className="font-serif text-4xl font-black tracking-tight text-primary md:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-lg font-bold text-foreground">{stat.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
          </MotionGlassCard>
        ))}
      </Reveal>
    </Section>
  );
}
