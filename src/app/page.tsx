import { FeatureGrid, Footer, HeroSection, MarketingNavbar } from "@/components/marketing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
      </main>
      <Footer />
    </div>
  );
}
