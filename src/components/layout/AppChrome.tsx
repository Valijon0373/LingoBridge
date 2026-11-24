"use client";

import React from "react";
import { usePathname } from "next/navigation";
import type { PublicPlatformSettings } from "@/lib/settings";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppChrome({
  children,
  publicSettings,
}: {
  children: React.ReactNode;
  publicSettings: PublicPlatformSettings;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer publicSettings={publicSettings} />
    </div>
  );
}
