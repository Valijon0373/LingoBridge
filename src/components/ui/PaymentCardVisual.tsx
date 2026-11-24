"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { RiCheckLine, RiFileCopyLine } from "react-icons/ri";
import logoImg from "@/assets/logo.jpg";

interface PaymentCardVisualProps {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  cardHolderLabel: string;
  copyLabel: string;
  copiedLabel: string;
  brandName?: string;
}

export function PaymentCardVisual({
  cardNumber,
  cardHolder,
  bankName,
  cardHolderLabel,
  copyLabel,
  copiedLabel,
  brandName = "Lingo Bridge",
}: PaymentCardVisualProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  function handleCopy() {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (px - 0.5) * 18; // -9deg .. +9deg
    const rotateX = (0.5 - py) * 14; // -7deg .. +7deg
    setTilt({
      rotateX,
      rotateY,
      glareX: Math.round(px * 100),
      glareY: Math.round(py * 100),
    });
  }

  function handleMouseLeave() {
    setHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  }

  return (
    <div style={{ perspective: "1000px" }} className="w-full py-1">
      <div
        ref={cardRef}
        onMouseEnter={() => setHovering(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background:
            "linear-gradient(135deg, #0B1F38 0%, #153A63 38%, #1F5588 70%, #0E2B4A 100%)",
          transform: hovering
            ? `rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d",
          transition: hovering
            ? "transform 90ms ease-out, box-shadow 250ms ease-out"
            : "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease-out",
        }}
        className="group relative w-full overflow-hidden rounded-[22px] border border-white/15 p-5 sm:p-6 text-white shadow-[0_18px_38px_rgba(11,31,56,0.34),inset_0_1px_1px_rgba(255,255,255,0.28)] hover:shadow-[0_26px_52px_rgba(11,31,56,0.45),inset_0_1px_1px_rgba(255,255,255,0.38)]"
      >
        {/* Rich Ambient Aurora Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-14 h-56 w-56 rounded-full bg-[#00C896]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-14 h-60 w-60 rounded-full bg-sky-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/15 blur-2xl"
        />

        {/* Subtle Brushed Metallic Texture */}
        <div
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        {/* Dynamic 3D Specular Light Glare following cursor */}
        <div
          aria-hidden="true"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(circle 220px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.24), rgba(0,200,150,0.08) 45%, transparent 72%)`,
          }}
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        />

        <div
          style={{ transform: "translateZ(20px)" }}
          className="relative z-10 flex flex-col justify-between gap-5"
        >
          {/* Top Row: Brand Logo + Bank/Network Label */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white/30">
                <Image
                  src={logoImg}
                  alt={brandName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white drop-shadow-2xs">
                {brandName}
              </span>
            </div>

            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-xs">
              {bankName || "UZCARD / HUMO"}
            </span>
          </div>

          {/* Middle Row: Realistic Gold EMV Chip + Copy Pill & Contactless NFC */}
          <div className="flex items-center justify-between gap-3">
            {/* Metallic Gold EMV Chip */}
            <div className="relative h-8 w-11 overflow-hidden rounded-[7px] border border-[#F5DFA0]/60 bg-gradient-to-br from-[#F7E3A1] via-[#DFB753] to-[#AE8426] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_2px_6px_rgba(0,0,0,0.28)]">
              <svg
                viewBox="0 0 44 32"
                fill="none"
                className="h-full w-full opacity-55"
                aria-hidden="true"
              >
                <path
                  d="M15 0V32M29 0V32M0 11H15M29 11H44M0 21H15M29 21H44M15 16H29"
                  stroke="#5E440C"
                  strokeWidth="1.2"
                />
                <rect
                  x="15"
                  y="9"
                  width="14"
                  height="14"
                  rx="2.5"
                  stroke="#5E440C"
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Glass Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#143558] active:scale-95 cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <RiCheckLine className="h-3.5 w-3.5 text-emerald-300 group-hover:text-emerald-600" />
                    <span>{copiedLabel}</span>
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className="h-3.5 w-3.5" />
                    <span>{copyLabel}</span>
                  </>
                )}
              </button>

              {/* Contactless NFC Waves */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-white/75"
                aria-hidden="true"
              >
                <path
                  d="M8.5 8.5C10.5 10.5 10.5 13.5 8.5 15.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 6C15.3 9.3 15.3 14.7 12 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15.5 3.5C20.2 8.2 20.2 15.8 15.5 20.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card Number (clickable to copy) */}
          <button
            type="button"
            onClick={handleCopy}
            title={copyLabel}
            className="w-full text-left font-mono text-lg sm:text-[21px] font-semibold tracking-[0.15em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors hover:text-emerald-200 cursor-pointer"
          >
            {cardNumber}
          </button>

          {/* Bottom Row: Card Holder + Luminous Overlapping Twin-Circle Mark */}
          <div className="flex items-end justify-between gap-3 pt-1">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-200/80">
                {cardHolderLabel}
              </p>
              <p className="mt-0.5 truncate text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white">
                {cardHolder}
              </p>
            </div>

            <div className="flex items-center shrink-0" aria-hidden="true">
              <span className="h-7 w-7 rounded-full bg-[#00C896]/90 shadow-xs" />
              <span className="-ml-2.5 h-7 w-7 rounded-full bg-sky-300/65 backdrop-blur-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
