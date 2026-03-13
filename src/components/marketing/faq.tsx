"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

const faqs = [
  {
    id: "payment",
    question: "How do I get paid?",
    answer:
      "Stripe automatically deposits earnings to your bank account. You control the payout schedule (daily, weekly, or monthly).",
  },
  {
    id: "fees",
    question: "What fees do you charge?",
    answer:
      "0% on sales. We earn from artist subscriptions ($0-$29/month). Stripe charges standard processing fees (~2.9% + 30¢).",
  },
  {
    id: "setup",
    question: "How long does setup take?",
    answer: "5 minutes. Sign up, connect Stripe, and you're live.",
  },
  {
    id: "international",
    question: "Can I sell internationally?",
    answer:
      "Yes. Stripe supports 135+ currencies and global payments.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do fans use?",
    answer:
      "Credit/debit cards, Apple Pay, Google Pay, and more via Stripe.",
  },
];

export function Faq() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Header animation - fade in + slide up
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Accordion animation - fade in + slide up
  const accordionVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about getting started
          </p>
        </motion.div>

        {/* Only render Accordion on client to avoid hydration mismatch */}
        {isClient ? (
          <motion.div
            variants={accordionVariants}
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
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ) : (
          // Fallback content for SSR - same structure but no interactive elements
          <div className="w-full space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b pb-4">
                <h3 className="text-left text-lg font-medium mb-2">
                  {faq.question}
                </h3>
                <div className="text-muted-foreground text-base">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}