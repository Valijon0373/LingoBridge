"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiCalculatorLine,
  RiCheckboxCircleLine,
  RiShieldCheckLine,
  RiPauseLine,
  RiPlayLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

const HERO_VIDEO_SOURCES = [
  "/videos/hero-bg.mp4",
  "https://assets.mixkit.co/videos/4518/4518-720.mp4",
  "https://assets.mixkit.co/videos/41456/41456-720.mp4",
];

export function HeroSection() {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  function toggleVideo() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }

  return (
    <section className="relative min-h-[86vh] flex items-center overflow-hidden bg-[#0B1F36] text-white">
      {/* Background Video Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-100 brightness-95 contrast-105"
        >
          {HERO_VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>

        {/* Balanced Light-Tint Navy Gradient so Video Stays Sharp & Clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071526]/72 via-[#0D2847]/48 to-[#071526]/42" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071526]/60 via-transparent to-[#071526]/30" />

        {/* Subtle Ambient Light Orbs */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00C896] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.08, 0.96, 1.08], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-28 right-0 h-[26rem] w-[26rem] rounded-full bg-[#2E6DA4] blur-[130px]"
        />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-xs"
          >
            <RiShieldCheckLine className="h-4 w-4 text-[#00C896]" />
            <span>{t.hero.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[54px] leading-[1.12] drop-shadow-xs"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base text-slate-100/95 sm:text-lg leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link href="/order">
              <Button
                size="lg"
                className="bg-[#00C896] hover:bg-[#00B085] text-slate-950 font-bold shadow-lg shadow-[#00C896]/25 gap-2 px-7"
              >
                {t.hero.primaryCta}
                <RiArrowRightLine className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#calculator">
              <Button
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-md gap-2"
              >
                <RiCalculatorLine className="h-5 w-5" />
                {t.hero.secondaryCta}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4 }}
            className="mt-10 grid gap-3 sm:grid-cols-3 text-sm text-slate-100"
          >
            {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 backdrop-blur-md px-3.5 py-2.5"
              >
                <RiCheckboxCircleLine className="h-4 w-4 shrink-0 text-[#00C896]" />
                <span className="text-xs sm:text-[13px] font-medium">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Scroll Hint & Video Play/Pause Control */}
      <div className="absolute bottom-5 inset-x-0 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a
          href="#services"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <RiArrowDownLine className="h-4 w-4 text-[#00C896]" />
          </motion.span>
          {t.common.services}
        </a>

        <button
          type="button"
          onClick={toggleVideo}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-black/50 transition-colors cursor-pointer"
          aria-label={isPlaying ? "Videoni to‘xtatish" : "Videoni ijro etish"}
        >
          {isPlaying ? (
            <>
              <RiPauseLine className="h-3.5 w-3.5" />
              <span>Video</span>
            </>
          ) : (
            <>
              <RiPlayLine className="h-3.5 w-3.5" />
              <span>Video</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
