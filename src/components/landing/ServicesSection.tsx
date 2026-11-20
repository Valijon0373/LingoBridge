"use client";

import React from "react";
import Link from "next/link";
import {
  RiArrowRightLine as ArrowRight,
  RiBookOpenLine as BookOpen,
  RiFileCheckLine as FileCheck2,
  RiTranslate2 as Languages,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import {
  getServiceLocalizedDescription,
  getServiceLocalizedName,
} from "@/lib/i18n/dictionaries";
import { formatUZS } from "@/lib/utils";
import type { ServiceDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ICONS = [BookOpen, FileCheck2, Languages];

export function ServicesSection({ services }: { services: ServiceDTO[] }) {
  const { locale, t } = useI18n();

  return (
    <section id="services" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t.landing.servicesTitle}
          </h2>
          <p className="mt-3 text-slate-600">{t.landing.servicesSubtitle}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const name = getServiceLocalizedName(service, locale);
            const desc = getServiceLocalizedDescription(service, locale);

            return (
              <Card
                key={service.id}
                className="flex flex-col justify-between p-6 hover:border-[#1F4E79]/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4FA] text-[#1F4E79]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {service.pricingType === "PER_PAGE"
                        ? t.common.perPage
                        : t.common.fixedPrice}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{name}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-[#1F4E79]">
                      {formatUZS(service.price, locale)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {service.pricingType === "PER_PAGE" ? `/ ${t.common.perPage}` : ""}
                    </span>
                  </div>

                  <Link href={`/order?serviceId=${encodeURIComponent(service.id)}`} className="mt-4 block">
                    <Button variant="outline" className="w-full justify-between group">
                      <span>{t.common.select}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
