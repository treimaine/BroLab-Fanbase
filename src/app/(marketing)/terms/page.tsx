"use client";

import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { AlertTriangle, Lock, Mail, MapPin, Shield } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as any },
  },
};

export default function TermsPage() {
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
            <Lock className="h-4 w-4 text-primary" />
            Legal document • Last updated: January 21, 2026
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 md:px-6 lg:py-20">
        {/* Hero section with clear hierarchy */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12 space-y-4 text-center"
        >
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Terms of Service
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Please read these terms carefully before using BroLab Fanbase. By accessing our platform, you agree to be bound by these terms.
          </p>
        </motion.div>

        {/* Quick navigation - reduce cognitive load */}
        <motion.nav
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Quick Navigation
          </h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <a href="#acceptance" className="text-primary transition-colors hover:underline">1. Acceptance of Terms</a>
            <a href="#accounts" className="text-primary transition-colors hover:underline">3. User Accounts</a>
            <a href="#content" className="text-primary transition-colors hover:underline">4. Content</a>
            <a href="#payments" className="text-primary transition-colors hover:underline">5. Payments</a>
            <a href="#prohibited" className="text-primary transition-colors hover:underline">6. Prohibited Activities</a>
            <a href="#termination" className="text-primary transition-colors hover:underline">8. Termination</a>
          </div>
        </motion.nav>
        
        <div className="space-y-12">
          {/* Section 1: Acceptance - Chunked for readability */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            id="acceptance"
            className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">1. Acceptance of Terms</h2>
            <p className="text-base leading-relaxed">
              By accessing or using BroLab Fanbase (&quot;the Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Platform.
            </p>
          </motion.section>

          {/* Section 2: Eligibility */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
            className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">2. Eligibility</h2>
            <p className="text-base leading-relaxed">
              You must be at least 13 years old to use the Platform. If you are under 18, you must have parental or guardian consent. By using the Platform, you represent that you meet these requirements.
            </p>
          </motion.section>

          {/* Section 3: User Accounts - Visual hierarchy with cards */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            id="accounts"
            className="scroll-mt-20 space-y-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">3. User Accounts</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">3.1 Account Creation</h3>
                <p className="text-base leading-relaxed">
                  You must create an account to access certain features. You agree to provide accurate, current, and complete information and to keep your account information updated.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">3.2 Account Security</h3>
                <p className="text-base leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">3.3 Account Types</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50">
                    <h4 className="mb-2 font-semibold text-foreground">Artist Accounts</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">For creators who want to share content and monetize their work</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50">
                    <h4 className="mb-2 font-semibold text-foreground">Fan Accounts</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">For users who want to follow artists and purchase content</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4: Content - Chunked with visual separation */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
            id="content"
            className="scroll-mt-20 space-y-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">4. Content</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">4.1 Your Content</h3>
                <p className="text-base leading-relaxed">
                  You retain ownership of content you upload (&quot;Your Content&quot;). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, distribute, and display Your Content on the Platform.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">4.2 Content Guidelines</h3>
                <p className="mb-3 text-base leading-relaxed">You agree not to upload content that:</p>
                <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Infringes on intellectual property rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Contains hate speech, harassment, or discrimination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Promotes violence or illegal activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Contains explicit sexual content (unless age-gated)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Violates any applicable laws or regulations</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">4.3 Content Moderation</h3>
                <p className="text-base leading-relaxed">
                  We reserve the right to remove content that violates these Terms or our community guidelines, without prior notice.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 5: Payments - Trust signals with visual cards */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            id="payments"
            className="scroll-mt-20 space-y-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">5. Payments and Transactions</h2>
            
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Secure payments powered by Stripe</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">5.1 Artist Revenue</h3>
                <p className="text-base leading-relaxed">
                  Artists can sell digital content and event tickets. We charge a platform fee on each transaction. Payment processing is handled by Stripe.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">5.2 Fan Purchases</h3>
                <p className="text-base leading-relaxed">
                  All purchases are final unless otherwise stated. Refunds are at the discretion of the artist or as required by law.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">5.3 Pricing</h3>
                <p className="text-base leading-relaxed">
                  Artists set their own prices. We reserve the right to adjust platform fees with 30 days notice.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 6: Prohibited Activities - Clear visual warnings */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.55 }}
            id="prohibited"
            className="scroll-mt-20 space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 backdrop-blur-xl shadow-lg shadow-destructive/5 md:p-8"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">6. Prohibited Activities</h2>
            </div>
            <p className="text-base leading-relaxed">You agree not to:</p>
            <ul className="space-y-3 rounded-lg border border-border bg-background p-4">
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Use the Platform for any illegal purpose</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Impersonate others or provide false information</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Attempt to gain unauthorized access to the Platform</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Interfere with or disrupt the Platform&apos;s operation</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Use automated systems (bots) without permission</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Scrape or harvest data from the Platform</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-4 w-4 text-destructive" />
                <span>Circumvent payment systems or fees</span>
              </li>
            </ul>
          </motion.section>

          {/* Section 7: Intellectual Property */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">7. Intellectual Property</h2>
            <p className="text-base leading-relaxed">
              The Platform, including its design, features, and content (excluding Your Content), is owned by BroLab Entertainment and protected by copyright, trademark, and other intellectual property laws.
            </p>
          </motion.section>

          {/* Section 8: Termination */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.65 }}
            id="termination"
            className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">8. Termination</h2>
            <p className="text-base leading-relaxed">
              We may suspend or terminate your account at any time for violation of these Terms or for any other reason. You may delete your account at any time through your account settings.
            </p>
          </motion.section>

          {/* Legal sections grouped for better scanning */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
            className="space-y-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl shadow-lg shadow-primary/5 md:p-8"
          >
            <section className="scroll-mt-20 space-y-3">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">9. Disclaimers</h2>
              <p className="text-base leading-relaxed">
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE. WE ARE NOT RESPONSIBLE FOR CONTENT UPLOADED BY USERS.
              </p>
            </section>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">10. Limitation of Liability</h2>
                <p className="text-base leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BROLAB ENTERTAINMENT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">11. Indemnification</h2>
                <p className="text-base leading-relaxed">
                  You agree to indemnify and hold harmless BroLab Entertainment from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">12. Dispute Resolution</h2>
                <p className="text-base leading-relaxed">
                  Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">13. Changes to Terms</h2>
                <p className="text-base leading-relaxed">
                  We may modify these Terms at any time. We will notify you of material changes by email or through the Platform. Continued use after changes constitutes acceptance of the new Terms.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">14. Governing Law</h2>
                <p className="text-base leading-relaxed">
                  These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.
                </p>
              </section>
            </div>
          </motion.div>

          {/* Contact section - Trust signal with clear CTA */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.75 }}
            className="scroll-mt-20 rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-xl shadow-lg shadow-primary/10 md:p-8"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">15. Contact Information</h2>
            <p className="mb-4 text-base leading-relaxed">
              For questions about these Terms, contact us:
            </p>
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:legal@brolabentertainment.com" className="font-medium text-primary transition-colors hover:underline">
                  legal@brolabentertainment.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>BroLab Entertainment, Fr</span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
