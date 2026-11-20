"use client";

import React, { useState } from "react";
import {
  RiArrowDownSLine as ChevronDown,
  RiPhoneLine as Phone,
  RiSendPlaneLine as Send,
  RiRobot2Line as Bot,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function ContactFaqSection() {
  const { t } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 90 123 45 67";
  const supportTelegram =
    process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/lingobridge_admin";
  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "lingobridge_bot";

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Contact Column */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t.landing.contactTitle}
            </h2>
            <p className="mt-3 text-slate-600">{t.landing.contactSubtitle}</p>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:${supportPhone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1F4E79]/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDF4FA] text-[#1F4E79]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t.landing.phoneLabel}</p>
                  <p className="text-sm font-semibold text-slate-900">{supportPhone}</p>
                </div>
              </a>

              <a
                href={supportTelegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1F4E79]/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDF4FA] text-[#1F4E79]">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t.landing.telegramLabel}</p>
                  <p className="text-sm font-semibold text-slate-900">{supportTelegram.replace("https://", "")}</p>
                </div>
              </a>

              <a
                href={`https://t.me/${botUsername.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-300 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t.landing.botLabel}</p>
                  <p className="text-sm font-semibold text-slate-900">@{botUsername.replace(/^@/, "")}</p>
                </div>
              </a>
            </div>
          </div>

          {/* FAQ Column */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-slate-900 mb-5">{t.landing.faqTitle}</h3>
            <div className="space-y-3">
              {t.landing.faqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <Card key={idx} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-slate-900 hover:bg-slate-50/70 cursor-pointer"
                    >
                      <span className="text-sm sm:text-base">{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
