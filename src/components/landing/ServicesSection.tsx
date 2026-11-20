"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiBookOpenLine,
  RiFileCheckLine,
  RiTranslate2,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import {
  getServiceLocalizedDescription,
  getServiceLocalizedName,
} from "@/lib/i18n/dictionaries";
import { formatUZS } from "@/lib/utils";
import type { ServiceDTO } from "@/types";
import { Button } from "@/components/ui/Button";

const ICONS = [RiBookOpenLine, RiFileCheckLine, RiTranslate2];

export function ServicesSection({ services }: { services: ServiceDTO[] }) {
  const { locale, t } = useI18n();

  return (
    <section id="services" className="py-20 sm:py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <span className="inline-block rounded-full bg-[#EDF4FA] px-3.5 py-1 text-xs font-semibold text-[#1F4E79] uppercase tracking-wider">
            {t.common.services}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t.landing.servicesTitle}
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {t.landing.servicesSubtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const name = getServiceLocalizedName(service, locale);
            const desc = getServiceLocalizedDescription(service, locale);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/70 hover:border-[#1F4E79]/35"
              >
                {/* Animated Top Gradient Accent Line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1F4E79] via-[#00C896] to-[#2E6DA4] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF4FA] text-[#1F4E79] transition-colors duration-300 group-hover:bg-[#1F4E79] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {service.pricingType === "PER_PAGE"
                        ? t.common.perPage
                        : t.common.fixedPrice}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-[#1F4E79] transition-colors">
                    {name}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-[#1F4E79]">
                      {formatUZS(service.price, locale)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {service.pricingType === "PER_PAGE" ? `/ ${t.common.perPage}` : ""}
                    </span>
                  </div>

                  <Link
                    href={`/order?serviceId=${encodeURIComponent(service.id)}`}
                    className="mt-4 block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between group-hover:bg-[#1F4E79] group-hover:text-white group-hover:border-[#1F4E79] transition-all"
                    >
                      <span>{t.common.select}</span>
                      <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
