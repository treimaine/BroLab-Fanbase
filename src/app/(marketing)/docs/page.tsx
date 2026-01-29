import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  HelpCircle,
  Music,
  Users
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | BroLab Fanbase",
  description:
    "Learn how to use BroLab Fanbase - guides for artists and fans",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Documentation
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about using BroLab Fanbase
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Tabs defaultValue="getting-started" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="artists">For Artists</TabsTrigger>
            <TabsTrigger value="fans">For Fans</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
              <p className="text-muted-foreground mb-8">
                Welcome to BroLab Fanbase! Follow these steps to get started.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <Music className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">I&apos;m an Artist</h3>
                <p className="text-muted-foreground mb-4">
                  Create your hub, upload content, and connect with fans
                  directly.
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>1. Sign up and select &quot;Artist&quot; role</li>
                  <li>2. Complete your profile setup</li>
                  <li>3. Add your social links</li>
                  <li>4. Upload your first product or event</li>
                  <li>5. Share your hub link with fans</li>
                </ol>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Get Started as Artist</Link>
                </Button>
              </Card>

              <Card className="p-6">
                <Users className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">I&apos;m a Fan</h3>
                <p className="text-muted-foreground mb-4">
                  Follow your favorite artists and support them directly.
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>1. Sign up and select &quot;Fan&quot; role</li>
                  <li>2. Browse and follow artists</li>
                  <li>3. Add a payment method</li>
                  <li>4. Purchase content or tickets</li>
                  <li>5. Download and enjoy your purchases</li>
                </ol>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-up">Get Started as Fan</Link>
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* For Artists */}
          <TabsContent value="artists" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Artists</h2>
              <p className="text-muted-foreground mb-8">
                Learn how to make the most of your artist hub.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="profile">
                <AccordionTrigger className="text-lg font-semibold">
                  Setting Up Your Profile
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Your profile is the first thing fans see. Make it count!
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Display Name:</strong> Your artist name (can be
                      changed anytime)
                    </li>
                    <li>
                      <strong>Slug:</strong> Your unique URL (e.g.,
                      brolab.fan/yourname)
                    </li>
                    <li>
                      <strong>Bio:</strong> Tell fans about yourself (max 500
                      characters)
                    </li>
                    <li>
                      <strong>Avatar:</strong> Profile picture (square, min
                      400x400px)
                    </li>
                    <li>
                      <strong>Cover Image:</strong> Banner image (16:9 ratio,
                      min 1920x1080px)
                    </li>
                  </ul>
                  <p className="text-sm">
                    💡 Tip: Use high-quality images that represent your brand.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="links">
                <AccordionTrigger className="text-lg font-semibold">
                  Managing Links
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>Add links to your social media and external content.</p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Social Links
                    </h4>
                    <p className="mb-2">
                      Connect your official social media accounts:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Instagram, X (Twitter), YouTube</li>
                      <li>Spotify, Apple Music, SoundCloud</li>
                      <li>TikTok, Facebook, Twitch</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Custom Links
                    </h4>
                    <p className="mb-2">Add any external links:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Latest release on streaming platforms</li>
                      <li>Merch store</li>
                      <li>Official website</li>
                      <li>Any other relevant links</li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    💡 Tip: Reorder links by dragging them. Put your most
                    important links at the top.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="products">
                <AccordionTrigger className="text-lg font-semibold">
                  Uploading Products
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Sell your music, videos, and other digital content directly
                    to fans.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Product Types
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Music:</strong> Audio files (MP3, WAV, FLAC) -
                        Max 50MB
                      </li>
                      <li>
                        <strong>Video:</strong> Video files (MP4, MOV) - Max
                        500MB
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Required Information
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Title and description</li>
                      <li>Cover image (square, min 800x800px)</li>
                      <li>Price in USD</li>
                      <li>Visibility (public or private)</li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    💡 Tip: Private products are only visible to you. Use this
                    for testing before making them public.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="events">
                <AccordionTrigger className="text-lg font-semibold">
                  Creating Events
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Promote your concerts, shows, and other events to your fans.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Event Details
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Event title and date</li>
                      <li>Venue name and city</li>
                      <li>Ticket URL (link to ticketing platform)</li>
                      <li>Event image (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Event Status
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Upcoming:</strong> Event is scheduled
                      </li>
                      <li>
                        <strong>Sold Out:</strong> No more tickets available
                      </li>
                      <li>
                        <strong>Past:</strong> Event has already happened
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    💡 Tip: Update event status to &quot;Sold Out&quot; when tickets are
                    gone to create urgency for future events.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="billing">
                <AccordionTrigger className="text-lg font-semibold">
                  Getting Paid
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Track your earnings and manage payouts through Stripe
                    Connect.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Setting Up Payouts
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to Dashboard → Billing</li>
                      <li>Click &quot;Setup Payout Method&quot;</li>
                      <li>Complete Stripe Connect onboarding</li>
                      <li>Add your bank account details</li>
                      <li>Verify your identity (required by Stripe)</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Payment Schedule
                    </h4>
                    <p>
                      Payouts are processed automatically by Stripe based on
                      your payout schedule (typically weekly or monthly).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Fees
                    </h4>
                    <p>
                      BroLab Fanbase takes a small platform fee. Stripe also
                      charges payment processing fees. All fees are transparent
                      in your transaction history.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* For Fans */}
          <TabsContent value="fans" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Fans</h2>
              <p className="text-muted-foreground mb-8">
                Learn how to support your favorite artists.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="following">
                <AccordionTrigger className="text-lg font-semibold">
                  Following Artists
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Follow artists to see their latest content in your
                    personalized feed.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      How to Follow
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Visit an artist&apos;s hub page</li>
                      <li>Click the &quot;Follow&quot; button</li>
                      <li>
                        Their content will now appear in your feed at /me/[your-username]
                      </li>
                    </ol>
                  </div>
                  <p className="text-sm">
                    💡 Tip: You can unfollow at any time by clicking &quot;Unfollow&quot;
                    on their hub page.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="purchasing">
                <AccordionTrigger className="text-lg font-semibold">
                  Purchasing Content
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Buy music, videos, and other digital content directly from
                    artists.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      How to Purchase
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Browse products on an artist&apos;s hub</li>
                      <li>Click &quot;Buy Now&quot; on the product you want</li>
                      <li>Complete checkout with Stripe</li>
                      <li>
                        Access your purchase in /me/[your-username]/purchases
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Payment Methods
                    </h4>
                    <p>We accept all major credit and debit cards via Stripe:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Visa, Mastercard, American Express</li>
                      <li>Apple Pay, Google Pay</li>
                      <li>And more payment methods depending on your region</li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    💡 Tip: Save your payment method for faster checkout next
                    time.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="downloads">
                <AccordionTrigger className="text-lg font-semibold">
                  Downloading Your Purchases
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Access and download your purchased content anytime from your
                    purchases page.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      How to Download
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to /me/[your-username]/purchases</li>
                      <li>Find the product you want to download</li>
                      <li>Click the &quot;Download&quot; button</li>
                      <li>The file will download to your device</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Download Limits
                    </h4>
                    <p>
                      You can download your purchases as many times as you need.
                      Download links are valid for 1 hour for security reasons.
                    </p>
                  </div>
                  <p className="text-sm">
                    💡 Tip: Keep your purchases organized by downloading them to
                    a dedicated folder on your device.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-methods">
                <AccordionTrigger className="text-lg font-semibold">
                  Managing Payment Methods
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Save and manage your payment methods for faster checkout.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Adding a Payment Method
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to /me/[your-username]/billing</li>
                      <li>Click &quot;Payment Methods&quot; tab</li>
                      <li>Click &quot;Add Payment Method&quot;</li>
                      <li>Enter your card details securely via Stripe</li>
                      <li>Set as default (optional)</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Security
                    </h4>
                    <p>
                      Your payment information is securely stored by Stripe. We
                      never see or store your full card details.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="billing-history">
                <AccordionTrigger className="text-lg font-semibold">
                  Viewing Billing History
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <p>
                    Track all your purchases and transactions in one place.
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Accessing Your History
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Go to /me/[your-username]/billing</li>
                      <li>Click &quot;Billing History&quot; tab</li>
                      <li>View all your past orders</li>
                      <li>Click on any order to see details</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Order Details
                    </h4>
                    <p>Each order shows:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Date and time of purchase</li>
                      <li>Items purchased</li>
                      <li>Total amount paid</li>
                      <li>Payment method used</li>
                      <li>Order status</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground mb-8">
                Common questions about BroLab Fanbase.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  What is BroLab Fanbase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  BroLab Fanbase is a platform that allows artists to create
                  their own hub to connect directly with fans. Artists can sell
                  digital content, promote events, and build their community
                  without relying on algorithms or middlemen.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  How much does it cost to use BroLab Fanbase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Creating an account is free for both artists and fans. Artists
                  pay a small platform fee on sales, and Stripe charges payment
                  processing fees. There are no monthly subscription fees or
                  hidden costs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  Can I change my role from Fan to Artist?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Currently, roles are set during onboarding and cannot be
                  changed. If you need to switch roles, please contact our
                  support team. We&apos;re working on making this easier in the
                  future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  What file formats are supported for uploads?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="mb-2">
                    <strong>Music:</strong> MP3, WAV, FLAC (max 50MB)
                  </p>
                  <p>
                    <strong>Video:</strong> MP4, MOV (max 500MB)
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  How long does it take to receive payouts?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Payouts are processed by Stripe according to your payout
                  schedule (typically weekly or monthly). The exact timing
                  depends on your bank and location. You can view your payout
                  schedule in your Stripe Connect dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
                <AccordionTrigger>
                  Is my payment information secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! All payments are processed securely through Stripe, a
                  PCI-compliant payment processor. We never see or store your
                  full card details. Your payment information is encrypted and
                  protected by industry-leading security standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-7">
                <AccordionTrigger>
                  Can I get a refund on a purchase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Refund policies are set by individual artists. Please contact
                  the artist directly through their social media or contact
                  information for refund requests. For technical issues with
                  downloads, contact our support team.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-8">
                <AccordionTrigger>
                  How do I delete my account?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To delete your account, please contact our support team at the
                  contact page. We&apos;ll process your request within 48 hours. Note
                  that this action is permanent and cannot be undone.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-9">
                <AccordionTrigger>
                  Can I use BroLab Fanbase on mobile?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! BroLab Fanbase is fully responsive and works great on
                  mobile devices. We&apos;re also working on dedicated iOS and
                  Android apps for an even better mobile experience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-10">
                <AccordionTrigger>
                  How do I report a problem or bug?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If you encounter any issues, please contact us through the
                  contact page with details about the problem. Include
                  screenshots if possible. We&apos;ll investigate and respond as
                  quickly as we can.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Support CTA */}
        <div className="max-w-5xl mx-auto mt-16">
          <Card className="p-8 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find what you&apos;re looking for? Get in touch with our support
              team.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
