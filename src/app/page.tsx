import React from "react";
import { getActiveServicesSafe } from "@/lib/services-loader";
import { LandingClient } from "@/components/landing/LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await getActiveServicesSafe();
  return <LandingClient services={services} />;
}
