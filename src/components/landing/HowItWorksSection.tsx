"use client";

import React from "react";
import {
  RiBankCardLine as CreditCard,
  RiDownloadLine as Download,
  RiFileUploadLine as FileUp,
  RiListCheck2 as ListChecks,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/Card";

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    { icon: ListChecks, title: t.landing.step1Title, desc: t.landing.step1Desc },
    { icon: FileUp, title: t.landing.step2Title, desc: t.landing.step2Desc },
    { icon: CreditCard, title: t.landing.step3Title, desc: t.landing.step3Desc },
    { icon: Download, title: t.landing.step4Title, desc: t.landing.step4Desc },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t.landing.stepsTitle}
          </h2>
          <p className="mt-3 text-slate-600">{t.landing.stepsSubtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={i} className="p-6 relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
