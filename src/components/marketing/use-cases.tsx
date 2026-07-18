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
              <span className="italic text-primary">creative universe.</span>
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

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
            <div className="relative rounded-[2rem] border border-border bg-card/60 p-6 backdrop-blur-2xl shadow-2xl shadow-primary/10">
              {/* Dashboard Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Your Hub</p>
                  <p className="mt-1 text-xl font-bold text-foreground">@elara.vance</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg">🎵</span>
                </div>
              </div>

              {/* Stat Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Fans", value: "2,841", trend: "+12%" },
                  { label: "Earned", value: "$4,320", trend: "+$640" },
                  { label: "Links", value: "1 link", trend: "All-in-one" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-center">
                    <p className="text-lg font-black text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                    <p className="mt-1 text-[10px] font-bold text-primary">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Recent Sales Feed */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Recent Activity</p>
                {[
                  { name: "Marcus T.", action: "Bought", item: "Silent Echo – Album", amount: "$12.00", time: "2m ago" },
                  { name: "Lena K.", action: "Joined", item: "Fan Community", amount: "Free", time: "5m ago" },
                  { name: "Diego R.", action: "Bought", item: "London Tour Ticket", amount: "$45.00", time: "11m ago" },
                ].map((sale) => (
                  <div key={sale.name} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {sale.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sale.name}</p>
                        <p className="text-xs text-muted-foreground">{sale.action}: {sale.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{sale.amount}</p>
                      <p className="text-[10px] text-muted-foreground/50">{sale.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Pill */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 -top-4 rounded-full border border-border/60 bg-card px-4 py-2 shadow-lg backdrop-blur-md"
              >
                <p className="text-sm font-black text-primary">+$57 <span className="text-xs font-semibold text-muted-foreground">today</span></p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
