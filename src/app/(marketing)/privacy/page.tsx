import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BroLab Fanbase",
  description: "Learn how BroLab Fanbase collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Trust signal banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-3 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            🔒 Privacy document • Last updated: January 21, 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:py-20">
        {/* Hero section with clear hierarchy */}
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Learn how we collect, use, and protect your personal information
          </p>
        </div>

        {/* Quick navigation */}
        <nav className="mb-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Quick Navigation
          </h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <a href="#introduction" className="text-primary transition-colors hover:underline">1. Introduction</a>
            <a href="#collection" className="text-primary transition-colors hover:underline">2. Information We Collect</a>
            <a href="#usage" className="text-primary transition-colors hover:underline">3. How We Use Your Information</a>
            <a href="#sharing" className="text-primary transition-colors hover:underline">4. Information Sharing</a>
            <a href="#security" className="text-primary transition-colors hover:underline">5. Data Security</a>
            <a href="#rights" className="text-primary transition-colors hover:underline">6. Your Rights</a>
          </div>
        </nav>

        <div className="space-y-12">
          {/* Section 1: Introduction */}
          <section id="introduction" className="scroll-mt-20 space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">1. Introduction</h2>
            <p className="text-base leading-relaxed">
              Welcome to BroLab Fanbase (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
          </section>

          {/* Section 2: Information Collection */}
          <section id="collection" className="scroll-mt-20 space-y-6 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">2. Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">2.1 Information You Provide</h3>
                <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Account information (name, email, username)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Profile information (bio, avatar, cover image)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Payment information (processed securely by Stripe)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Content you upload (music, videos, event details)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Communications with us</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">2.2 Information We Collect Automatically</h3>
                <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Device information (IP address, browser type, operating system)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Usage data (pages visited, features used, time spent)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Cookies and similar tracking technologies</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Usage */}
          <section id="usage" className="scroll-mt-20 space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">3. How We Use Your Information</h2>
            <p className="text-base leading-relaxed">We use your information to:</p>
            <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Provide and maintain our services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Process transactions and send notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Personalize your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Improve our platform and develop new features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Communicate with you about updates and promotions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Detect and prevent fraud and abuse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Comply with legal obligations</span>
              </li>
            </ul>
          </section>

          {/* Section 4: Sharing */}
          <section id="sharing" className="scroll-mt-20 space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">4. Information Sharing</h2>
            <p className="text-base leading-relaxed">We may share your information with:</p>
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div>
                <h4 className="mb-1 font-semibold text-foreground">Service Providers</h4>
                <p className="text-sm">Clerk (authentication), Convex (database), Stripe (payments)</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">Artists</h4>
                <p className="text-sm">When you purchase content or follow an artist</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">Legal Requirements</h4>
                <p className="text-sm">When required by law or to protect our rights</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">Business Transfers</h4>
                <p className="text-sm">In connection with a merger, acquisition, or sale of assets</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="text-lg">🔒</span>
                <span>We do not sell your personal information to third parties</span>
              </p>
            </div>
          </section>

          {/* Section 5: Security */}
          <section id="security" className="scroll-mt-20 space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">5. Data Security</h2>
            <p className="text-base leading-relaxed">
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
              <li className="flex items-start gap-2">
                <span className="text-primary">🔐</span>
                <span>Encryption in transit (HTTPS/TLS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">🔐</span>
                <span>Secure authentication via Clerk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">🔐</span>
                <span>PCI-compliant payment processing via Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">🔐</span>
                <span>Regular security audits and monitoring</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 6: Your Rights */}
          <section id="rights" className="scroll-mt-20 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">6. Your Rights</h2>
            <p className="text-base leading-relaxed">You have the right to:</p>
            <ul className="space-y-2 rounded-lg border border-border bg-background p-4">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Access your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Correct inaccurate data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Request deletion of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Object to processing of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Export your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Withdraw consent at any time</span>
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed">
              To exercise these rights, contact us at{" "}
              <a href="mailto:legal@brolabentertainment.com" className="font-medium text-primary transition-colors hover:underline">
                legal@brolabentertainment.com
              </a>
            </p>
          </section>

          {/* Additional sections grouped */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8">
            <section className="scroll-mt-20 space-y-3">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">7. Cookies</h2>
              <p className="text-base leading-relaxed">
                We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality.
              </p>
            </section>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">8. Children&apos;s Privacy</h2>
                <p className="text-base leading-relaxed">
                  Our platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">9. International Data Transfers</h2>
                <p className="text-base leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
                </p>
              </section>
            </div>

            <div className="border-t border-border pt-6">
              <section className="scroll-mt-20 space-y-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">10. Changes to This Policy</h2>
                <p className="text-base leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>
            </div>
          </div>

          {/* Contact section */}
          <section className="scroll-mt-20 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">11. Contact Us</h2>
            <p className="mb-4 text-base leading-relaxed">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <a href="mailto:legal@brolabentertainment.com" className="font-medium text-primary transition-colors hover:underline">
                  legal@brolabentertainment.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span>BroLab Entertainment, [Address]</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
