"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { HeroSection } from "./_components/HeroSection";
import { PrinciplesSection } from "./_components/PrinciplesSection";
import { TeamSection } from "./_components/TeamSection";
import { StaffSection } from "./_components/StaffSection";
import { PartnersCarousel } from "./_components/PartnersCarousel";
import { BenefitsSection } from "./_components/BenefitsSection";
import { TestimonialsSection } from "./_components/TestimonialsSection";
import { ContactSection } from "./_components/ContactSection";

/**
 * About Page - Main entry point
 * Showcases company information, team, partners, and contact details
 */
export default function AboutPage() {
  // Initialize scroll animations for all sections
  useScrollAnimation();

  return (
    <div className="w-full overflow-x-hidden">
      <HeroSection />
      <PrinciplesSection />
      <TeamSection />
      <StaffSection />
      <PartnersCarousel />
      <BenefitsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
