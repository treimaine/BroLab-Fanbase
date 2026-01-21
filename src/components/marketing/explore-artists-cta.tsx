"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function ExploreArtistsCta() {
  return (
    <section className="relative overflow-hidden bg-background py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] border border-border bg-card/50 px-8 py-16 text-center backdrop-blur-3xl shadow-xl shadow-primary/5 md:px-16 md:py-24"
        >
          {/* Background Glow */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(var(--primary),0.1)_0%,transparent_70%)]" />
          
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Join the Revolution</span>
            </div>
            
            <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Ready to meet your <br />
              <span className="italic text-muted-foreground">superfans?</span>
            </h2>
            
            <p className="mt-8 text-xl text-muted-foreground">
              Stop playing by their rules. Start owning your career today.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg" className="h-16 rounded-full bg-primary px-10 text-lg font-bold text-primary-foreground hover:bg-primary/90">
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
        </motion.div>
      </div>
    </section>
  );
}
