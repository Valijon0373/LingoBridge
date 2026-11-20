"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine as ArrowRight, RiCalculatorLine as Calculator } from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { getServiceLocalizedName } from "@/lib/i18n/dictionaries";
import {
  TRANSLATION_DIRECTIONS,
  calculateOrderPrice,
  formatDirection,
  formatUZS,
} from "@/lib/utils";
import type { ServiceDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PriceCalculator({ services }: { services: ServiceDTO[] }) {
  const { locale, t } = useI18n();
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [directionId, setDirectionId] = useState(TRANSLATION_DIRECTIONS[0].id);
  const [pages, setPages] = useState<number>(10);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0],
    [services, selectedServiceId]
  );

  const direction = useMemo(
    () =>
      TRANSLATION_DIRECTIONS.find((d) => d.id === directionId) ??
      TRANSLATION_DIRECTIONS[0],
    [directionId]
  );

  const pricing = useMemo(() => {
    if (!selectedService) return { normalizedPages: 1, totalPrice: 0 };
    return calculateOrderPrice(
      selectedService.price,
      selectedService.pricingType,
      pages
    );
  }, [selectedService, pages]);

  if (!selectedService) return null;

  const orderHref = `/order?serviceId=${encodeURIComponent(selectedService.id)}&source=${direction.source}&target=${direction.target}&pages=${pricing.normalizedPages}`;

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t.landing.calcTitle}
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              {t.landing.calcSubtitle}
            </p>
          </div>

          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 shadow-md">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.landing.calcService}
                  </label>
                  <select
                    value={selectedService.id}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {getServiceLocalizedName(svc, locale)} — {formatUZS(svc.price, locale)}
                        {svc.pricingType === "PER_PAGE" ? ` / ${t.common.perPage}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.landing.calcDirection}
                  </label>
                  <select
                    value={directionId}
                    onChange={(e) => setDirectionId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                  >
                    {TRANSLATION_DIRECTIONS.map((dir) => (
                      <option key={dir.id} value={dir.id}>
                        {formatDirection(dir.source, dir.target, locale)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.landing.calcPages}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    disabled={selectedService.pricingType === "FIXED"}
                    value={selectedService.pricingType === "FIXED" ? 1 : pages}
                    onChange={(e) => setPages(Math.max(1, Number(e.target.value) || 1))}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 disabled:bg-slate-100 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                  />
                  {selectedService.pricingType === "FIXED" && (
                    <p className="mt-1 text-xs text-slate-500">{t.landing.calcFixedNote}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-[#EDF4FA] p-5 border border-[#1F4E79]/15">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1F4E79]/80">
                    {t.landing.calcEstimated}
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold text-[#1F4E79]">
                    {formatUZS(pricing.totalPrice, locale)}
                  </p>
                </div>
                <Link href={orderHref}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t.landing.calcStartOrder}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
