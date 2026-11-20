"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowRightLine,
  RiCalculatorLine,
  RiTranslate2,
  RiFilePaper2Line,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { getServiceLocalizedName } from "@/lib/i18n/dictionaries";
import {
  TRANSLATION_DIRECTIONS,
  calculateOrderPrice,
  cn,
  formatDirection,
  formatUZS,
} from "@/lib/utils";
import type { ServiceDTO } from "@/types";
import { Button } from "@/components/ui/Button";

export function PriceCalculator({ services }: { services: ServiceDTO[] }) {
  const { locale, t } = useI18n();
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [directionId, setDirectionId] = useState(TRANSLATION_DIRECTIONS[0].id);
  const [pages, setPages] = useState<number>(12);

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
    <section
      id="calculator"
      className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 to-[#EDF4FA]/60 border-y border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F4E79] text-white shadow-md shadow-[#1F4E79]/25">
              <RiCalculatorLine className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t.landing.calcTitle}
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              {t.landing.calcSubtitle}
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <RiTranslate2 className="h-5 w-5 text-[#00C896] shrink-0" />
                <span>6 ta akademik va rasmiy til yo‘nalishi (UZ ↔ RU ↔ EN)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RiFilePaper2Line className="h-5 w-5 text-[#1F4E79] shrink-0" />
                <span>PDF yuklanganda sahifalar soni serverda avtomatik aniqlanadi</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60">
              <div className="space-y-6">
                {/* Service Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    {t.landing.calcService}
                  </label>
                  <select
                    value={selectedService.id}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 focus:border-[#1F4E79] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {getServiceLocalizedName(svc, locale)} —{" "}
                        {formatUZS(svc.price, locale)}
                        {svc.pricingType === "PER_PAGE"
                          ? ` / ${t.common.perPage}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clickable Direction Chips */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    {t.landing.calcDirection}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRANSLATION_DIRECTIONS.map((dir) => {
                      const active = dir.id === directionId;
                      return (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => setDirectionId(dir.id)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                            active
                              ? "border-[#1F4E79] bg-[#1F4E79] text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#1F4E79]/40 hover:bg-slate-50"
                          )}
                        >
                          {formatDirection(dir.source, dir.target, locale)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pages Slider + Numeric Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-800">
                      {t.landing.calcPages}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      disabled={selectedService.pricingType === "FIXED"}
                      value={selectedService.pricingType === "FIXED" ? 1 : pages}
                      onChange={(e) =>
                        setPages(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-bold text-[#1F4E79] disabled:bg-slate-100 focus:border-[#1F4E79] focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={150}
                    disabled={selectedService.pricingType === "FIXED"}
                    value={
                      selectedService.pricingType === "FIXED"
                        ? 1
                        : Math.min(150, pages)
                    }
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full accent-[#00C896] cursor-pointer disabled:opacity-50"
                  />
                  {selectedService.pricingType === "FIXED" && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t.landing.calcFixedNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Animated Estimated Price Banner */}
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1F4E79] to-[#133554] p-6 text-white shadow-lg shadow-[#1F4E79]/20">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    {t.landing.calcEstimated}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={pricing.totalPrice}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 text-2xl sm:text-3xl font-extrabold text-white"
                    >
                      {formatUZS(pricing.totalPrice, locale)}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <Link href={orderHref}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#00C896] hover:bg-[#00B085] text-slate-950 font-bold"
                  >
                    {t.landing.calcStartOrder}
                    <RiArrowRightLine className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
