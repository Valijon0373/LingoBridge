"use client";

import React, { Suspense } from "react";
import { SlidingAuthCard } from "@/components/auth/SlidingAuthCard";

export default function RegisterPage() {
  return (
    <Suspense>
      <SlidingAuthCard initialMode="register" />
    </Suspense>
  );
}
