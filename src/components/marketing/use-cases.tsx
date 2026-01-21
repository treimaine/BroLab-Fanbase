"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Music, ShoppingBag, Ticket } from "lucide-react";

interface UseCase {
  icon: React.ElementType;
  title: string;
  description: string;
  benefit: string;
  color: string;
}

const useCases: UseCase[] = [
  {
    icon: Music,
    title: "Digital Drops",
    description: "Sell tracks, albums, and exclusive releases directly to your fans.",
    benefit: "Instant high-quality downloads",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: ShoppingBag,
    title: "Exclusive Merch",
    description: "Launch limited edition physical goods with custom purchase links.",
    benefit: "Direct fulfillment control",
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    icon: Ticket,
    title: "Live Events",
    description: "Sell tickets to your tours, listening parties, and virtual shows.",
    benefit: "Instant digital tickets",
    color: "bg-primary/10 text-primary",
  },
];

export function UseCases() {
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section className="relative overflow-hidden bg-background px-4 py-32 md:px-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Monetize your <br />
              <span className="text-muted-foreground/60 italic">creative universe.</span>
            </h2>
            <p className="mt-8 max-w-lg text-xl text-muted-foreground">
              One platform for everything you create. No hidden fees, no complex setups—just your work and your fans.
            </p>
            
            <div className="mt-12 space-y-8">
              {useCases.map((useCase, index) => (
                <motion.div 
                  key={useCase.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", useCase.color)}>
                    <useCase.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{useCase.title}</h3>
                    <p className="mt-1 text-muted-foreground">{useCase.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Abstract Editorial Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square">
              {/* Main Card */}
              <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] border border-border bg-card/50 p-8 backdrop-blur-2xl shadow-xl shadow-primary/5">
                <div className="h-full w-full rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
              </div>
              
              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute right-[5%] top-[10%] aspect-video w-[60%] rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md shadow-lg"
              >
                <div className="flex h-full items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted-foreground/20" />
                    <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-[15%] left-[5%] w-[50%] rounded-[2rem] border border-border bg-card/80 p-6 backdrop-blur-xl shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">Revenue</span>
                  <span className="text-sm font-bold text-primary">+$2,450</span>
                </div>
                <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[40%] bg-primary" />
                  <div className="h-full w-[20%] bg-muted-foreground/20" />
                  <div className="h-full w-[10%] bg-muted-foreground/10" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
