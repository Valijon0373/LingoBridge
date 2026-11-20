"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  RiBankCardLine,
  RiDownloadLine,
  RiFileUploadLine,
  RiListCheck2,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";

const PROCESS_VIDEO_SOURCES = [
  "/videos/process-bg.mp4",
  "https://assets.mixkit.co/videos/45923/45923-720.mp4",
];

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    { num: "01", icon: RiListCheck2, title: t.landing.step1Title, desc: t.landing.step1Desc },
    { num: "02", icon: RiFileUploadLine, title: t.landing.step2Title, desc: t.landing.step2Desc },
    { num: "03", icon: RiBankCardLine, title: t.landing.step3Title, desc: t.landing.step3Desc },
    { num: "04", icon: RiDownloadLine, title: t.landing.step4Title, desc: t.landing.step4Desc },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-24 overflow-hidden bg-[#0B1F36] text-white"
    >
      {/* Atmospheric Video Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-100 brightness-95 contrast-105"
        >
          {PROCESS_VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#081729]/65 via-[#0E2A4A]/50 to-[#081729]/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-block rounded-full border border-[#00C896]/40 bg-[#00C896]/15 px-3.5 py-1 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            4-step workflow
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t.landing.stepsTitle}
          </h2>
          <p className="mt-3 text-slate-300">{t.landing.stepsSubtitle}</p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 shadow-xl shadow-black/20 hover:border-[#00C896]/50 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00C896] text-slate-950 shadow-md shadow-[#00C896]/25">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-white/25">
                    {step.num}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
