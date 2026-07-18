import { Footer, MarketingNavbar } from "@/components/marketing";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      {/* pt-20 offsets the fixed navbar (h-20). The landing page renders its
          own full-bleed hero under a transparent navbar and does NOT use this
          layout, so it is unaffected. */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
