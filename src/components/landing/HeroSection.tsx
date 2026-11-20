"use client";

import React from "react";
import Link from "next/link";
import {
  RiArrowRightLine as ArrowRight,
  RiCalculatorLine as Calculator,
  RiCheckboxCircleLine as CheckCircle2,
  RiFileTextLine as FileText,
  RiShieldCheckLine as ShieldCheck,
  RiSendPlaneLine as Send,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#EDF4FA]/80 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1F4E79]/20 bg-[#EDF4FA] px-3.5 py-1.5 text-xs font-semibold text-[#1F4E79]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.hero.badge}
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-[1.15]">
              {t.hero.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/order">
                <Button size="lg" className="gap-2">
                  {t.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#calculator">
                <Button variant="outline" size="lg" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  {t.hero.secondaryCta}
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F4E79]" />
                <span>{t.hero.trust1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F4E79]" />
                <span>{t.hero.trust2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F4E79]" />
                <span>{t.hero.trust3}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Avtoreferat_PhD.pdf</p>
                    <p className="text-xs text-slate-500">PDF • 24 {t.common.pages} (auto)</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  UZ → EN
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-600">{t.orderWizard.unitPrice}</span>
                  <span className="font-semibold text-slate-900">30 000 so‘m / {t.common.perPage}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#EDF4FA] px-4 py-3.5 text-sm">
                  <span className="font-medium text-[#1F4E79]">{t.orderWizard.totalPrice}</span>
                  <span className="text-lg font-bold text-[#1F4E79]">720 000 so‘m</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center">
                <div>
                  <p className="text-xl font-bold text-[#1F4E79]">6</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.hero.stat1Label}</p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-xl font-bold text-[#1F4E79]">24/7</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.hero.stat2Label}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1F4E79]">100%</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.hero.stat3Label}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-2.5 text-xs text-sky-900">
                <Send className="h-4 w-4 shrink-0 text-sky-600" />
                <span>{t.hero.trust3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
