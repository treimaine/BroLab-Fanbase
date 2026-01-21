'use client'

import { ExploreArtistsCta, FeatureGrid, Footer, HeroSection, MarketingNavbar } from "@/components/marketing";
import dynamic from "next/dynamic";
import posthog from 'posthog-js';
import { useEffect } from 'react';

// Lazy load below-fold sections
const HowItWorks = dynamic(() => import("@/components/marketing/how-it-works").then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="h-96" />, // Placeholder to prevent layout shift
});

const UseCases = dynamic(() => import("@/components/marketing/use-cases").then(mod => ({ default: mod.UseCases })), {
  loading: () => <div className="h-96" />,
});

const SocialProof = dynamic(() => import("@/components/marketing/social-proof").then(mod => ({ default: mod.SocialProof })), {
  loading: () => <div className="h-96" />,
});

const Faq = dynamic(() => import("@/components/marketing/faq").then(mod => ({ default: mod.Faq })), {
  loading: () => <div className="h-96" />,
});

export default function Home() {
  useEffect(() => {
    posthog.capture('landing_page_view')
  }, [])
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <UseCases />
        <SocialProof />
        <Faq />
        <ExploreArtistsCta />
      </main>
      <Footer />
    </div>
  );
}
