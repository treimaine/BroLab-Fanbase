"use client";

import { CtaPill, GlassCard, Highlight, Reveal, Section, SectionHeading } from "@/components/ds";
import { cardReveal, fadeIn, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  timeLabel: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Create your hub",
    description: "Claim your unique link and customize your profile in seconds.",
    timeLabel: "Setup in under 5 min",
  },
  {
    number: "02",
    title: "Connect Stripe",
    description: "Link your bank for automatic, direct payouts from every sale.",
    timeLabel: "Verified in 2 min",
  },
  {
    number: "03",
    title: "Go live",
    description: "Share your link everywhere and watch your community grow.",
    timeLabel: "Instant — no approval needed",
  },
];

const MotionGlassCard = motion.create(GlassCard);

export function HowItWorks() {
  const scrollToHero = () => {
    const emailInput = document.getElementById("hero-email-input");
    if (emailInput) {
      emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => emailInput.focus(), 500);
    }
  };

  return (
    <Section>
      <SectionHeading
        title={<>Simple by <Highlight>design.</Highlight></>}
        subtitle="From zero to live in under 10 minutes. No technical skills needed."
      />

      <Reveal variants={staggerContainer} className="grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <MotionGlassCard
            key={step.number}
            variants={cardReveal}
            radius="xl"
            padding="xl"
            className="group"
          >
            <div className="mb-8 font-serif text-5xl font-bold text-primary/40 transition-colors group-hover:text-primary">
              {step.number}
            </div>

            <h3 className="mb-4 text-2xl font-bold text-foreground">
              {step.title}
            </h3>

            <p className="text-lg leading-relaxed text-muted-foreground">
              {step.description}
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors group-hover:text-primary">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {step.timeLabel}
            </div>
          </MotionGlassCard>
        ))}
      </Reveal>

      <Reveal variants={fadeIn} className="mt-20 flex justify-center">
        <CtaPill
          label="Ready to take control?"
          action="Claim your link"
          onClick={scrollToHero}
        />
      </Reveal>
    </Section>
  );
}
