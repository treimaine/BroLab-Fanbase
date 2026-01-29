"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  DollarSign,
  Download,
  Globe,
  Heart,
  Link2,
  Lock,
  Music,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap
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
      staggerChildren: 0.1,
    },
  },
};

export default function FeaturesPage() {
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
              <Sparkles className="h-4 w-4" />
              Everything you need to succeed
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Own your career.
              <br />
              <span className="italic text-primary">No middlemen.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to connect with fans, sell your work, and build your empire—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base rounded-2xl">
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl">
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* For Artists Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary mb-6">
            <Music className="h-4 w-4" />
            For Artists
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Your hub. Your rules.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, grow, and monetize your fanbase.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Personal Hub */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Personal Hub</h3>
              <p className="text-muted-foreground mb-6">
                Your own branded page with custom URL, cover image, bio, and social links.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Custom slug (brolab.fan/yourname)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Cover image & avatar branding</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Bio & social media integration</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Digital Products */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Music className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Digital Products</h3>
              <p className="text-muted-foreground mb-6">
                Upload and sell music, videos, and exclusive content directly to fans.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Music files (MP3, WAV, FLAC) up to 50MB</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Video files (MP4, MOV) up to 500MB</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Set your own prices in USD</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Events & Tickets */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Events & Tickets</h3>
              <p className="text-muted-foreground mb-6">
                Promote concerts, shows, and events with integrated ticketing links.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Create unlimited events</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Link to external ticketing platforms</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Track sold-out status</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Custom Links */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Link2 className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Custom Links</h3>
              <p className="text-muted-foreground mb-6">
                Add external links to your latest releases, merch store, or website.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Linktree-style link management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Drag & drop reordering</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Toggle active/inactive</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Direct Payouts */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <DollarSign className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Direct Payouts</h3>
              <p className="text-muted-foreground mb-6">
                Get paid directly to your bank account via Stripe Connect.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>100% of sales revenue (minus Stripe fees)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Automatic weekly or monthly payouts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Real-time transaction tracking</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Analytics */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Track your growth with real-time stats and insights.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Follower count & growth trends</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Revenue breakdown by product</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Event performance metrics</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* For Fans Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary mb-6">
              <Heart className="h-4 w-4" />
              For Fans
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Support artists directly.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover, follow, and support your favorite artists without the noise.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
          >
            {/* Personalized Feed */}
            <motion.div variants={fadeInUp}>
              <Card className="group h-full p-6 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all bg-background/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Personalized Feed</h3>
                <p className="text-sm text-muted-foreground">
                  See updates from all the artists you follow in one place.
                </p>
              </Card>
            </motion.div>

            {/* Secure Purchases */}
            <motion.div variants={fadeInUp}>
              <Card className="group h-full p-6 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all bg-background/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Purchases</h3>
                <p className="text-sm text-muted-foreground">
                  Buy content safely with Stripe. Apple Pay & Google Pay supported.
                </p>
              </Card>
            </motion.div>

            {/* Instant Downloads */}
            <motion.div variants={fadeInUp}>
              <Card className="group h-full p-6 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all bg-background/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Downloads</h3>
                <p className="text-sm text-muted-foreground">
                  Download your purchases immediately. Access them anytime, forever.
                </p>
              </Card>
            </motion.div>

            {/* Privacy First */}
            <motion.div variants={fadeInUp}>
              <Card className="group h-full p-6 rounded-2xl border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all bg-background/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is yours. We never sell your information to third parties.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary mb-6">
            <Zap className="h-4 w-4" />
            Pricing Plans
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Choose your plan.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade as you grow. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto"
        >
          {/* Free Plan */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full p-8 rounded-2xl border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Perfect for getting started
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>5 products</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>5 events</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>5 custom links</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Music uploads only (50MB max)</span>
                </li>
              </ul>

              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full p-8 rounded-2xl border-primary/50 shadow-lg shadow-primary/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  POPULAR
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">$19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For serious artists
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Unlimited products</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Unlimited events</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Unlimited links</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Video uploads enabled (500MB max)</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
              </ul>

              <Button asChild className="w-full h-12 rounded-xl">
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
          className="text-center text-sm text-muted-foreground mt-8"
        >
          All plans include 100% of sales revenue (minus Stripe processing fees). No platform fees.
        </motion.p>
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
