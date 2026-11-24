"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowDownSLine,
  RiPhoneLine,
  RiSendPlaneLine,
  RiRobot2Line,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import type { PublicPlatformSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export function ContactFaqSection({
  publicSettings,
}: {
  publicSettings: PublicPlatformSettings;
}) {
  const { t } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const supportPhone = publicSettings.supportPhone;
  const supportTelegram = publicSettings.supportTelegram;
  const botUsername = publicSettings.telegramBotUsername;

  const contacts = [
    {
      href: `tel:${supportPhone.replace(/\s/g, "")}`,
      external: false,
      icon: RiPhoneLine,
      iconStyle: "bg-[#EDF4FA] text-[#1F4E79]",
      label: t.landing.phoneLabel,
      value: supportPhone,
    },
    {
      href: supportTelegram,
      external: true,
      icon: RiSendPlaneLine,
      iconStyle: "bg-[#EDF4FA] text-[#1F4E79]",
      label: t.landing.telegramLabel,
      value: supportTelegram.replace("https://", ""),
    },
    {
      href: `https://t.me/${botUsername.replace(/^@/, "")}`,
      external: true,
      icon: RiRobot2Line,
      iconStyle: "bg-emerald-50 text-[#00A87E]",
      label: t.landing.botLabel,
      value: `@${botUsername.replace(/^@/, "")}`,
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {t.landing.contactTitle}
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              {t.landing.contactSubtitle}
            </p>

            <div className="mt-7 space-y-3.5">
              {contacts.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <motion.a
                    key={idx}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noreferrer" : undefined}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#1F4E79]/40 hover:shadow-md transition-all"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{c.label}</p>
                      <p className="text-sm font-bold text-slate-900">{c.value}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* FAQ Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {t.landing.faqTitle}
            </h3>
            <div className="space-y-3">
              {t.landing.faqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-6 py-4.5 text-left font-semibold text-slate-900 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                      <RiArrowDownSLine
                        className={cn(
                          "h-5 w-5 shrink-0 text-[#1F4E79] transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-600 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
