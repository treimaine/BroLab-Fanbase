"use client";

import { Eyebrow, GlassCard, Highlight, Reveal, Section } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { scaleIn } from "@/lib/motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function ExploreArtistsCta() {
  return (
    <Section spacing="compact">
      <Reveal variants={scaleIn}>
        <GlassCard
          interactive={false}
          radius="xl"
          padding="none"
          className="overflow-hidden px-8 py-16 text-center shadow-glow backdrop-blur-3xl md:px-16 md:py-24"
        >
          {/* Background Glow */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <Eyebrow variant="solid" className="mb-6">
              <Sparkles className="h-4 w-4" />
              Join the Revolution
            </Eyebrow>

            <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Ready to meet your <br />
              <Highlight>superfans?</Highlight>
            </h2>

            <p className="mt-8 text-xl text-muted-foreground">
              Stop playing by their rules. Start owning your career today.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg" className="h-16 rounded-full px-10 text-lg font-bold">
                  Launch Your Hub
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="h-16 rounded-full border-border bg-transparent px-10 text-lg font-bold text-foreground hover:bg-accent hover:text-foreground">
                  Explore Artists
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </Section>
  );
}
