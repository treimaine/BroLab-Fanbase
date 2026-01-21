"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Eye, Rocket, Zap } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "Direct Access",
    description:
      "Connect with your fans without the interference of algorithms. Your content, their feed, zero friction.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Rocket,
    title: "Instant Payouts",
    description:
      "Sell music, merch, and tickets worldwide. Get paid directly to your bank account via Stripe Connect.",
    gradient: "from-primary to-blue-500",
  },
  {
    icon: Eye,
    title: "Full Ownership",
    description:
      "You own your data, your audience, and your revenue. No platform lock-in, ever. Build your empire.",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function FeatureGrid() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <section className="relative bg-background px-4 py-32 md:px-6 transition-colors duration-300">
      {/* Background Accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full max-w-7xl">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-card/50 p-8 transition-colors hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5 md:p-10"
            >
              <div>
                <div className={cn(
                  "mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <feature.icon className="h-8 w-8" />
                </div>
                
                <h3 className="mb-4 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {feature.title}
                </h3>
                
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              <div className="mt-12 flex h-1 w-full overflow-hidden rounded-full bg-muted">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileInView={{ x: "0%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={cn("h-full w-full bg-gradient-to-r", feature.gradient)} 
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
