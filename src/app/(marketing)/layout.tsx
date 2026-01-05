import { Footer, MarketingNavbar } from "@/components/marketing";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
