"use client";

import React from "react";
import Link from "next/link";
import {
  RiBookOpenLine as BookOpenCheck,
  RiPhoneLine as Phone,
  RiSendPlaneLine as Send,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import type { PublicPlatformSettings } from "@/lib/settings";

export function Footer({ publicSettings }: { publicSettings: PublicPlatformSettings }) {
  const { t } = useI18n();
  const supportPhone = publicSettings.supportPhone;
  const supportTelegram = publicSettings.supportTelegram;
  const botUsername = publicSettings.telegramBotUsername;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">{t.common.brand}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 max-w-sm leading-relaxed">
              {t.common.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              {t.common.services}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/#services" className="hover:text-[#1F4E79]">
                  {t.common.services}
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-[#1F4E79]">
                  {t.common.calculator}
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-[#1F4E79]">
                  {t.common.orderNow}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1F4E79]">
                  {t.common.myOrders}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              {t.landing.contactTitle}
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#1F4E79]" />
                <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="hover:text-[#1F4E79]">
                  {supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#1F4E79]" />
                <a
                  href={supportTelegram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1F4E79]"
                >
                  {t.landing.telegramLabel}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-600" />
                <a
                  href={`https://t.me/${botUsername.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1F4E79]"
                >
                  @{botUsername.replace(/^@/, "")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 flex items-center justify-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Lingo Bridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
