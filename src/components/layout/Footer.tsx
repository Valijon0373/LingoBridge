"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RiPhoneLine as Phone,
  RiSendPlaneLine as Send,
} from "react-icons/ri";
import logoImg from "@/assets/logo.jpg";
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
        <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white shadow-xs ring-1 ring-slate-200/70">
                <Image
                  src={logoImg}
                  alt={t.common.brand}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
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
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-[#1F4E79]" />
                <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="hover:text-[#1F4E79]">
                  {supportPhone}
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
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
              <li className="flex items-center justify-center md:justify-start gap-2">
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
