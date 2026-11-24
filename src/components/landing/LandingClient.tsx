"use client";

import React from "react";
import type { ServiceDTO } from "@/types";
import type { PublicPlatformSettings } from "@/lib/settings";
import { HeroSection } from "./HeroSection";
import { ServicesSection } from "./ServicesSection";
import { PriceCalculator } from "./PriceCalculator";
import { HowItWorksSection } from "./HowItWorksSection";
import { ContactFaqSection } from "./ContactFaqSection";

export function LandingClient({
  services,
  publicSettings,
}: {
  services: ServiceDTO[];
  publicSettings: PublicPlatformSettings;
}) {
  return (
    <div>
      <HeroSection />
      <ServicesSection services={services} />
      <PriceCalculator services={services} />
      <HowItWorksSection />
      <ContactFaqSection publicSettings={publicSettings} />
    </div>
  );
}
