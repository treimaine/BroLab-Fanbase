"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Globe, Mail, Send, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully! We'll get back to you soon.");
    setIsSubmitting(false);

    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background - matching landing page */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-[10%] top-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[20%] h-[35%] w-[35%] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Trust signal banner */}
      <div className="relative z-10 border-b border-border bg-muted/30 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 md:px-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"
          >
            <Zap className="h-4 w-4 text-primary" />
            We typically respond within 24 hours
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-20">
        {/* Hero section with clear hierarchy */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12 space-y-4 text-center"
        >
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Form - Takes 2 columns */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl md:p-8 shadow-lg shadow-primary/5">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      required
                      disabled={isSubmitting}
                      className="h-12 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      required
                      disabled={isSubmitting}
                      className="h-12 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help?"
                    required
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                    disabled={isSubmitting}
                    className="rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="group h-12 w-full rounded-2xl text-base font-semibold" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Sidebar - Takes 1 column */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Email Card */}
            <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 transition-all hover:border-primary/50 hover:shadow-primary/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Email</h3>
              <a
                href="mailto:contact@brolabentertainment.com"
                className="text-sm text-primary transition-colors hover:underline"
              >
                contact@brolabentertainment.com
              </a>
            </div>

            {/* Social Media Card */}
            <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 transition-all hover:border-primary/50 hover:shadow-primary/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Social Media</h3>
              <div className="space-y-2">
                <a
                  href="https://twitter.com/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>Twitter</span>
                </a>
                <a
                  href="https://instagram.com/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://linkedin.com/company/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 transition-all hover:border-primary/50 hover:shadow-primary/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Office Hours</h3>
              <p className="text-sm text-muted-foreground">
                Monday - Friday
              </p>
              <p className="text-sm font-medium text-foreground">
                9:00 AM - 6:00 PM EST
              </p>
            </div>

            {/* Response Time Card */}
            <div className="group rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-xl shadow-lg shadow-primary/10 transition-all hover:border-primary/30 hover:shadow-primary/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days
              </p>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-16 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">How do I become an artist on BroLab?</h3>
              <p className="text-sm text-muted-foreground">
                Simply sign up and select &quot;Artist&quot; during onboarding. You&apos;ll get access to your dashboard immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards and payment methods through Stripe, our secure payment processor.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">How do payouts work for artists?</h3>
              <p className="text-sm text-muted-foreground">
                Artists receive payouts directly to their connected Stripe account. Funds are typically available within 2-7 business days.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Can I cancel my subscription anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time from your account settings. No questions asked.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
