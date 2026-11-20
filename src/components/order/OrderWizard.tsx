"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiArrowLeftLine as ArrowLeft,
  RiArrowRightLine as ArrowRight,
  RiCheckLine as Check,
  RiCheckboxCircleLine as CheckCircle2,
  RiFileCopyLine as Copy,
  RiBankCardLine as CreditCard,
  RiFileTextLine as FileText,
  RiTranslate2 as Languages,
  RiLoader4Line as Loader2,
  RiShieldCheckLine as ShieldCheck,
  RiSparklingLine as Sparkles,
  RiUploadCloud2Line as UploadCloud,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import {
  getServiceLocalizedDescription,
  getServiceLocalizedName,
} from "@/lib/i18n/dictionaries";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  TRANSLATION_DIRECTIONS,
  calculateOrderPrice,
  cn,
  formatDirection,
  formatUZS,
  type LanguageCode,
} from "@/lib/utils";
import type { OrderDTO, PaymentMethodsDTO, ServiceDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function OrderWizard({
  initialServices,
  paymentMethods,
}: {
  initialServices: ServiceDTO[];
  paymentMethods: PaymentMethodsDTO;
}) {
  const { locale, t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [services] = useState<ServiceDTO[]>(initialServices);

  // Step 1: Service
  const [serviceId, setServiceId] = useState<string>(
    searchParams.get("serviceId") || initialServices[0]?.id || ""
  );

  // Step 2: Direction
  const [sourceLang, setSourceLang] = useState<LanguageCode>(
    (searchParams.get("source") as LanguageCode) || "UZ"
  );
  const [targetLang, setTargetLang] = useState<LanguageCode>(
    (searchParams.get("target") as LanguageCode) || "RU"
  );

  // Step 3: File + Pages
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inspectingPdf, setInspectingPdf] = useState(false);
  const [autoDetectedPages, setAutoDetectedPages] = useState(false);
  const [pageCount, setPageCount] = useState<number>(
    Math.max(1, Number(searchParams.get("pages")) || 1)
  );
  const [customerNote, setCustomerNote] = useState("");

  // Step 4 & 5: Created Order + Payment
  const [createdOrder, setCreatedOrder] = useState<OrderDTO | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const [paymentCompletedMessage, setPaymentCompletedMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support resuming payment for an existing order via ?payOrderId=...
  const resumeOrderId = searchParams.get("payOrderId");
  useEffect(() => {
    if (!resumeOrderId || !user) return;
    fetch(`/api/orders/${encodeURIComponent(resumeOrderId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { order?: OrderDTO } | null) => {
        if (data?.order) {
          setCreatedOrder(data.order);
          setStep(5);
        }
      })
      .catch(() => {});
  }, [resumeOrderId, user]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? services[0],
    [services, serviceId]
  );

  const estimatedPrice = useMemo(() => {
    if (!selectedService) return { normalizedPages: 1, totalPrice: 0 };
    return calculateOrderPrice(
      selectedService.price,
      selectedService.pricingType,
      pageCount
    );
  }, [selectedService, pageCount]);

  async function handleFileSelected(selected: File | null) {
    setError(null);
    setFile(selected);
    setAutoDetectedPages(false);

    if (!selected) return;

    const ext = selected.name.slice(selected.name.lastIndexOf(".")).toLowerCase();
    const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    if (!allowed.includes(ext)) {
      setError(t.orderWizard.allowedFormats);
      setFile(null);
      return;
    }

    if (selectedService?.pricingType === "FIXED") {
      setPageCount(1);
      return;
    }

    if (ext === ".pdf") {
      setInspectingPdf(true);
      try {
        const fd = new FormData();
        fd.append("file", selected);
        const res = await fetch("/api/orders/inspect-pdf", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json()) as {
          pageCount?: number | null;
          autoDetected?: boolean;
          error?: string;
          warning?: string | null;
        };
        if (res.ok && data.autoDetected && data.pageCount) {
          setPageCount(data.pageCount);
          setAutoDetectedPages(true);
        } else if (data.warning || data.error) {
          setError(data.warning || data.error || null);
        }
      } catch {
        // Allow manual entry on network hiccup
      } finally {
        setInspectingPdf(false);
      }
    }
  }

  async function handleCreateOrder() {
    if (!selectedService || !file) return;
    setError(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("serviceId", selectedService.id);
      fd.append("sourceLanguage", sourceLang);
      fd.append("targetLanguage", targetLang);
      fd.append(
        "pageCount",
        String(selectedService.pricingType === "FIXED" ? 1 : pageCount)
      );
      if (customerNote.trim()) {
        fd.append("customerNote", customerNote.trim());
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as { order?: OrderDTO; error?: string };
      if (!res.ok || !data.order) {
        setError(data.error || "Buyurtma yaratib bo‘lmadi");
        return;
      }

      setCreatedOrder(data.order);
      setStep(5);
    } catch {
      setError("Server bilan aloqa uzildi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReceiptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createdOrder || !receiptFile) return;

    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("orderId", createdOrder.id);
      fd.append("receipt", receiptFile);

      const res = await fetch("/api/payments/receipt", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { order?: OrderDTO; error?: string };
      if (!res.ok) {
        setError(data.error || "Chekni yuklab bo‘lmadi");
        return;
      }
      if (data.order) setCreatedOrder(data.order);
      setPaymentCompletedMessage(t.orderWizard.receiptSuccess);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGatewayPay(provider: "CLICK" | "PAYME" | "MOCK") {
    if (!createdOrder) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrder.id,
          provider,
        }),
      });
      const data = (await res.json()) as {
        result?: { checkoutUrl?: string; instantPaid?: boolean; message?: string };
        error?: string;
      };
      if (!res.ok || !data.result) {
        setError(data.error || "To‘lovni amalga oshirib bo‘lmadi");
        return;
      }

      if (data.result.checkoutUrl) {
        window.location.href = data.result.checkoutUrl;
        return;
      }

      if (data.result.instantPaid) {
        setPaymentCompletedMessage(
          data.result.message || "To‘lov muvaffaqiyatli amalga oshirildi!"
        );
      }
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  }

  const stepsMeta = [
    { num: 1, label: t.orderWizard.step1 },
    { num: 2, label: t.orderWizard.step2 },
    { num: 3, label: t.orderWizard.step3 },
    { num: 4, label: t.orderWizard.step4 },
    { num: 5, label: t.orderWizard.step5 },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDF4FA] text-[#1F4E79]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{t.auth.loginTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.auth.loginSubtitle}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login?next=/order">
            <Button className="w-full sm:w-auto">{t.common.login}</Button>
          </Link>
          <Link href="/register?next=/order">
            <Button variant="outline" className="w-full sm:w-auto">
              {t.common.register}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t.orderWizard.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t.orderWizard.subtitle}</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepsMeta.map((s, idx) => {
            const done = step > s.num;
            const active = step === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      done
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-[#1F4E79] text-white ring-4 ring-[#1F4E79]/15"
                          : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      active ? "text-[#1F4E79]" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stepsMeta.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 rounded-full",
                      step > s.num ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="p-6 sm:p-8 shadow-sm">
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {t.orderWizard.chooseService}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => {
                const selected = svc.id === selectedService?.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setServiceId(svc.id);
                      if (svc.pricingType === "FIXED") setPageCount(1);
                    }}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-5 text-left transition-all cursor-pointer",
                      selected
                        ? "border-[#1F4E79] bg-[#EDF4FA]/60 ring-2 ring-[#1F4E79]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {getServiceLocalizedName(svc, locale)}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                        {getServiceLocalizedDescription(svc, locale)}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/70">
                      <span className="text-base font-bold text-[#1F4E79]">
                        {formatUZS(svc.price, locale)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        {svc.pricingType === "PER_PAGE"
                          ? `/ ${t.common.perPage}`
                          : `(${t.common.fixedPrice})`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedService}>
                {t.common.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DIRECTION */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {t.orderWizard.chooseDirection}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRANSLATION_DIRECTIONS.map((dir) => {
                const active =
                  dir.source === sourceLang && dir.target === targetLang;
                return (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => {
                      setSourceLang(dir.source);
                      setTargetLang(dir.target);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-5 py-4 transition-all cursor-pointer",
                      active
                        ? "border-[#1F4E79] bg-[#EDF4FA]/70 ring-2 ring-[#1F4E79]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Languages className="h-5 w-5 text-[#1F4E79]" />
                      <span className="font-medium text-slate-900">
                        {formatDirection(dir.source, dir.target, locale)}
                      </span>
                    </div>
                    {active && <CheckCircle2 className="h-5 w-5 text-[#1F4E79]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                {t.common.back}
              </Button>
              <Button onClick={() => setStep(3)}>
                {t.common.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: FILE UPLOAD + AUTO PDF PAGE COUNT */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {t.orderWizard.uploadTitle}
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const dropped = e.dataTransfer.files?.[0] ?? null;
                handleFileSelected(dropped);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-[#1F4E79] bg-[#EDF4FA]"
                  : "border-slate-300 bg-slate-50/70 hover:border-[#1F4E79]/60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1F4E79] shadow-xs border border-slate-200">
                {inspectingPdf ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                {inspectingPdf
                  ? t.orderWizard.detectingPages
                  : file
                    ? file.name
                    : t.orderWizard.uploadHint}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : t.orderWizard.allowedFormats}
              </p>
            </div>

            {file && (
              <div className="mt-6 space-y-4">
                {selectedService?.pricingType === "FIXED" ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                    {t.orderWizard.fixedPagesNote}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        {t.orderWizard.manualPagesLabel}
                      </label>
                      {autoDetectedPages && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t.orderWizard.detectedPagesBadge}: {pageCount}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      readOnly={autoDetectedPages}
                      value={pageCount}
                      onChange={(e) =>
                        setPageCount(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 read-only:bg-slate-50 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.orderWizard.noteLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder={t.orderWizard.notePlaceholder}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                {t.common.back}
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!file || inspectingPdf || pageCount < 1}
              >
                {t.common.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY */}
        {step === 4 && selectedService && file && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {t.orderWizard.summaryTitle}
            </h2>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-slate-500">{t.orderWizard.service}</span>
                <span className="font-semibold text-slate-900">
                  {getServiceLocalizedName(selectedService, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-slate-500">{t.orderWizard.direction}</span>
                <span className="font-semibold text-slate-900">
                  {formatDirection(sourceLang, targetLang, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-slate-500">{t.orderWizard.document}</span>
                <span className="font-medium text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#1F4E79]" />
                  {file.name}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-slate-500">{t.orderWizard.pageCount}</span>
                <span className="font-semibold text-slate-900">
                  {estimatedPrice.normalizedPages} {t.common.pages}
                  {autoDetectedPages ? " (PDF auto)" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-slate-500">{t.orderWizard.unitPrice}</span>
                <span className="font-medium text-slate-900">
                  {formatUZS(selectedService.price, locale)}
                  {selectedService.pricingType === "PER_PAGE"
                    ? ` / ${t.common.perPage}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#EDF4FA] px-5 py-4">
                <span className="font-semibold text-[#1F4E79]">
                  {t.orderWizard.totalPrice}
                </span>
                <span className="text-xl font-bold text-[#1F4E79]">
                  {formatUZS(estimatedPrice.totalPrice, locale)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#1F4E79]" />
              {t.orderWizard.serverPriceNote}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
                <ArrowLeft className="h-4 w-4" />
                {t.common.back}
              </Button>
              <Button onClick={handleCreateOrder} loading={submitting}>
                {t.orderWizard.createOrderBtn}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: PAYMENT */}
        {step === 5 && createdOrder && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t.orderWizard.paymentTitle}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t.orderWizard.orderNumber}:{" "}
                  <strong className="text-slate-900">#{createdOrder.orderNumber}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{t.orderWizard.totalPrice}</p>
                <p className="text-2xl font-bold text-[#1F4E79]">
                  {formatUZS(createdOrder.totalPrice, locale)}
                </p>
              </div>
            </div>

            {paymentCompletedMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-3 text-lg font-bold text-emerald-900">
                  #{createdOrder.orderNumber}
                </h3>
                <p className="mt-2 text-sm text-emerald-800 max-w-md mx-auto">
                  {paymentCompletedMessage}
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push("/dashboard")}>
                    {t.orderWizard.goToOrders}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Method 1: Card Transfer + Receipt Upload */}
                <div className="rounded-2xl border border-[#1F4E79]/30 bg-[#EDF4FA]/40 p-5">
                  <div className="flex items-center gap-2.5 text-[#1F4E79]">
                    <CreditCard className="h-5 w-5" />
                    <h3 className="font-semibold">{t.orderWizard.cardMethod}</h3>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">
                    {t.orderWizard.cardMethodDesc}
                  </p>

                  <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500">
                          {t.orderWizard.cardNumber} ({paymentMethods.cardTransfer.bankName})
                        </p>
                        <p className="font-mono text-base font-bold text-slate-900 tracking-wide">
                          {paymentMethods.cardTransfer.cardNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            paymentMethods.cardTransfer.cardNumber.replace(/\s/g, "")
                          );
                          setCopiedCard(true);
                          setTimeout(() => setCopiedCard(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedCard ? t.common.copied : t.common.copy}
                      </button>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">
                        {t.orderWizard.cardHolder}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {paymentMethods.cardTransfer.cardHolder}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleReceiptSubmit} className="mt-4 space-y-3">
                    <label className="block text-xs font-medium text-slate-700">
                      {t.orderWizard.uploadReceiptLabel}
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      required
                      onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#1F4E79] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#163A5B]"
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!receiptFile}
                      loading={submitting}
                    >
                      {t.orderWizard.uploadReceiptBtn}
                    </Button>
                  </form>
                </div>

                {/* Method 2: Modular Online Gateways (Click, Payme, Mock) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {t.orderWizard.onlineMethods}
                    </h3>
                    <div className="mt-4 space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        disabled={!paymentMethods.click.enabled || submitting}
                        onClick={() => handleGatewayPay("CLICK")}
                      >
                        <span className="font-semibold text-sky-700">
                          {t.orderWizard.payWithClick}
                        </span>
                        {!paymentMethods.click.enabled && (
                          <span className="text-[11px] text-slate-400">
                            {t.orderWizard.gatewayNotConfigured}
                          </span>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        disabled={!paymentMethods.payme.enabled || submitting}
                        onClick={() => handleGatewayPay("PAYME")}
                      >
                        <span className="font-semibold text-teal-700">
                          {t.orderWizard.payWithPayme}
                        </span>
                        {!paymentMethods.payme.enabled && (
                          <span className="text-[11px] text-slate-400">
                            {t.orderWizard.gatewayNotConfigured}
                          </span>
                        )}
                      </Button>

                      {paymentMethods.mock.enabled && (
                        <div className="pt-3 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            loading={submitting}
                            onClick={() => handleGatewayPay("MOCK")}
                          >
                            {t.orderWizard.mockPayBtn}
                          </Button>
                          <p className="mt-1.5 text-[11px] text-slate-500 text-center">
                            {t.orderWizard.mockPayDesc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <Link
                      href="/dashboard"
                      className="text-xs font-medium text-[#1F4E79] hover:underline"
                    >
                      {t.orderWizard.goToOrders} →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
