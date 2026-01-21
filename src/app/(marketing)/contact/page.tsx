"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Trust signal banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-3 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            💬 We typically respond within 24 hours
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-20">
        {/* Hero section with clear hierarchy */}
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
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
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">📧</span>
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
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Social Media</h3>
              <div className="space-y-2">
                <a
                  href="https://twitter.com/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>→</span>
                  <span>Twitter</span>
                </a>
                <a
                  href="https://instagram.com/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>→</span>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://linkedin.com/company/brolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>→</span>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">🕐</span>
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
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 rounded-xl border border-border bg-card p-6 md:p-8">
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
        </div>
      </div>
    </div>
  );
}
