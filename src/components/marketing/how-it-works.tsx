"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Create your hub",
    description: "Claim your unique link and customize your profile in seconds.",
  },
  {
    number: "02",
    title: "Connect Stripe",
    description: "Link your bank for automatic, direct payouts from every sale.",
  },
  {
    number: "03",
    title: "Go live",
    description: "Share your link everywhere and watch your community grow.",
  },
];

export function HowItWorks() {
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section className="relative overflow-hidden bg-background px-4 py-32 md:px-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Simple by <span className="italic text-primary">design.</span>
          </motion.h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-[2.5rem] border border-border bg-card/50 p-8 transition-colors hover:bg-card hover:border-primary/20 hover:shadow-lg md:p-12"
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

              <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                <CheckCircle2 className="h-4 w-4" />
                Completed in 1 min
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 text-muted-foreground">
            <span>Ready to take control?</span>
            <button className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors">
              Claim your link <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
