"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const faqs = [
  {
    id: "cost",
    question: "How much does BroLab actually cost?",
    answer:
      "BroLab takes 0% commission on your sales — you keep every dollar. We offer a free tier and paid plans starting at $9/month for advanced features. Stripe charges standard processing fees (~2.9% + 30¢).",
  },
  {
    id: "payment",
    question: "When do I get paid?",
    answer:
      "Stripe deposits earnings directly to your bank account. You choose the schedule: daily, weekly, or monthly. No 30-day hold, no minimum threshold.",
  },
  {
    id: "setup",
    question: "How long does it take to go live?",
    answer:
      "Under 5 minutes. Create your account, connect Stripe, customize your hub — and you're live. No approval process, no waiting.",
  },
  {
    id: "ownership",
    question: "Do I own my data and my audience?",
    answer:
      "100%. Your fan list, your sales data, your content — it's all yours. Export everything anytime. No lock-in, no algorithmic gatekeeping.",
  },
  {
    id: "switch",
    question: "I already use Linktree / Payhip / Gumroad. Why switch?",
    answer:
      "BroLab replaces your link-in-bio, your store, and your fan CRM in one place. One link, one dashboard, zero platform fees on sales. Less tools = less friction for your fans.",
  },
  {
    id: "international",
    question: "Can I sell to fans worldwide?",
    answer:
      "Yes. Stripe supports 135+ currencies and global payments. Your fans can pay with credit/debit cards, Apple Pay, Google Pay, and more.",
  },
];

export function Faq() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section className="py-32 px-4 md:px-6 bg-background transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Got <span className="italic text-primary">questions?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Everything you need to know before claiming your link.
          </p>
        </motion.div>

        {isClient ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ) : (
          <div className="w-full space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-border/50 pb-4">
                <h3 className="text-left text-lg font-semibold mb-2">
                  {faq.question}
                </h3>
                <div className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA after FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 text-muted-foreground">
            <span>Still have questions?</span>
            <Link
              href="/contact"
              className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors"
            >
              Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}