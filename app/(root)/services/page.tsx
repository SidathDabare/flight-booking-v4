"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ServicesHero } from "./_components/ServicesHero";
import { ServicesGrid } from "./_components/ServicesGrid";
import { BenefitsSection } from "../about/_components/BenefitsSection";
import { DestinationsGrid } from "./_components/DestinationsGrid";
import { PartnersCarousel } from "../about/_components/PartnersCarousel";
import { ContactSection } from "../about/_components/ContactSection";

/**
 * Services Page - Main entry point
 * Showcases all travel services, benefits, destinations, and partners
 */
export default function ServicesPage() {
  // Initialize scroll animations for all sections
  useScrollAnimation();

  return (
    <div className="w-full overflow-x-hidden">
      <ServicesHero />
      <ServicesGrid />
      <BenefitsSection />
      <DestinationsGrid />
      <PartnersCarousel />
      <ContactSection />
    </div>
  );
}
