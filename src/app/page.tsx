import React from "react";
import { getActiveServicesSafe } from "@/lib/services-loader";
import { getPublicSettings } from "@/lib/settings";
import { LandingClient } from "@/components/landing/LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, publicSettings] = await Promise.all([
    getActiveServicesSafe(),
    getPublicSettings(),
  ]);
  return <LandingClient services={services} publicSettings={publicSettings} />;
}
