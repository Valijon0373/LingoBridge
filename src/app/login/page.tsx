"use client";

import React, { Suspense } from "react";
import { SlidingAuthCard } from "@/components/auth/SlidingAuthCard";

export default function LoginPage() {
  return (
    <Suspense>
      <SlidingAuthCard initialMode="login" />
    </Suspense>
  );
}
