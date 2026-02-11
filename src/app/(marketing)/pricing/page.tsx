"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import {
    ArrowRight,
    Calendar,
    Check,
    Link2,
    Music,
    Sparkles,
    TrendingUp,
    Video,
    X,
    Zap,
} from "lucide-react";
import Link from "next/link";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-[10%] top-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -right-[10%] bottom-[20%] h-[35%] w-[35%] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" />
              Simple, transparent pricing
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Start free.
              <br />
              <span className="italic text-primary">Scale as you grow.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              No hidden fees. No platform commission. Just you and your fans.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto"
        >
          {/* Free Plan */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full p-8 md:p-10 rounded-3xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-muted-foreground">
                  Perfect for getting started
                </p>
              </div>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">5 products</span>
                    <p className="text-sm text-muted-foreground">Music tracks, albums, or releases</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">5 events</span>
                    <p className="text-sm text-muted-foreground">Concerts, shows, or listening parties</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">5 custom links</span>
                    <p className="text-sm text-muted-foreground">Latest releases, merch, or website</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-muted-foreground">Audio uploads only</span>
                    <p className="text-sm text-muted-foreground">50MB max file size</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-muted-foreground">No video uploads</span>
                  </div>
                </li>
              </ul>

              <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base">
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full p-8 md:p-10 rounded-3xl border-primary/50 shadow-xl shadow-primary/10 relative bg-gradient-to-br from-background to-primary/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold">
                  <Sparkles className="h-3 w-3 mr-1 inline" />
                  POPULAR
                </Badge>
              </div>
              
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">$19.99</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-muted-foreground">
                  For serious artists
                </p>
              </div>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unlimited products</span>
                    <p className="text-sm text-muted-foreground">No limit on digital products</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unlimited events</span>
                    <p className="text-sm text-muted-foreground">Create as many events as needed</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unlimited links</span>
                    <p className="text-sm text-muted-foreground">Merch, tickets, booking links</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Video uploads enabled</span>
                    <p className="text-sm text-muted-foreground">500MB max file size</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Priority support</span>
                    <p className="text-sm text-muted-foreground">Faster response times</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Advanced analytics</span>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </li>
              </ul>

              <Button asChild className="w-full h-12 rounded-xl text-base">
                <Link href="/sign-up">Upgrade to Premium</Link>
              </Button>
            </Card>
          </motion.div>
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          All plans include 100% of sales revenue (minus Stripe processing fees). No platform fees.
        </motion.p>
      </section>

      {/* Feature Comparison */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Compare plans
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <Card className="rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-6 font-bold">Feature</th>
                      <th className="text-center p-6 font-bold">Free</th>
                      <th className="text-center p-6 font-bold bg-primary/5">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Music className="h-5 w-5 text-primary" />
                          <span className="font-medium">Products</span>
                        </div>
                      </td>
                      <td className="text-center p-6">5</td>
                      <td className="text-center p-6 bg-primary/5 font-bold">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-medium">Events</span>
                        </div>
                      </td>
                      <td className="text-center p-6">5</td>
                      <td className="text-center p-6 bg-primary/5 font-bold">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Link2 className="h-5 w-5 text-primary" />
                          <span className="font-medium">Custom Links</span>
                        </div>
                      </td>
                      <td className="text-center p-6">5</td>
                      <td className="text-center p-6 bg-primary/5 font-bold">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-primary" />
                          <span className="font-medium">Video Uploads</span>
                        </div>
                      </td>
                      <td className="text-center p-6">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="text-center p-6 bg-primary/5">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">Max File Size</span>
                        </div>
                      </td>
                      <td className="text-center p-6">50MB</td>
                      <td className="text-center p-6 bg-primary/5 font-bold">500MB</td>
                    </tr>
                    <tr>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="font-medium">Support</span>
                        </div>
                      </td>
                      <td className="text-center p-6">Community</td>
                      <td className="text-center p-6 bg-primary/5 font-bold">Priority</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about pricing
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your Premium subscription at any time from your account settings. No questions asked.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">What happens to my content if I downgrade?</h3>
              <p className="text-muted-foreground">
                All existing content remains accessible. You just can&apos;t create new items until you&apos;re under the Free plan limits.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">Do I lose video uploads if I downgrade?</h3>
              <p className="text-muted-foreground">
                You can&apos;t upload new videos on the Free plan, but existing videos remain accessible to your fans.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">How do I upgrade?</h3>
              <p className="text-muted-foreground">
                Click &quot;Upgrade to Premium&quot; in your dashboard billing section. Payment is processed securely via Clerk Billing.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, Apple Pay, and Google Pay via Stripe. All payments are secure and encrypted.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to take control?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of artists building their careers on their own terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base rounded-2xl">
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl">
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
