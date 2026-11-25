"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RiRobot2Line as Bot,
  RiDownloadLine as Download,
  RiExternalLinkLine as ExternalLink,
  RiFileExcel2Line as FileSpreadsheet,
  RiFileTextLine as FileText,
  RiFileUploadLine as FileUp,
  RiLoader4Line as Loader2,
  RiBillLine as Receipt,
  RiSearchLine as Search,
  RiEqualizerLine as SlidersHorizontal,
} from "react-icons/ri";
import type { OrderStatus } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { getServiceLocalizedName } from "@/lib/i18n/dictionaries";
import { formatDirection, formatUZS, formatUzPhone, getFileDownloadUrl } from "@/lib/utils";
import type { OrderDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "WAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

export function AdminOrdersManager({ onChanged }: { onChanged?: () => void }) {
  const { locale, t } = useI18n();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>("IN_PROGRESS");
  const [adminNote, setAdminNote] = useState("");
  const [translationFile, setTranslationFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingTranslation, setUploadingTranslation] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { orders: OrderDTO[] };
        setOrders(data.orders);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 220);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const newBadgeLabel =
    locale === "ru" ? "Новый" : locale === "en" ? "New" : "Yangi";

  function openOrderModal(order: OrderDTO) {
    setSelectedOrder(order.isNew ? { ...order, isNew: false } : order);
    setNextStatus(order.status);
    setAdminNote(order.adminNote || "");
    setTranslationFile(null);
    setFeedback(null);

    if (order.isNew) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, isNew: false } : o))
      );
      void fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markSeen: true }),
      })
        .then(() => {
          onChanged?.();
        })
        .catch(() => {});
    }
  }

  async function handleUpdateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote }),
      });
      const data = (await res.json()) as { order?: OrderDTO; error?: string };
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order!.id ? data.order! : o))
        );
        setFeedback("Buyurtma holati muvaffaqiyatli yangilandi!");
        onChanged?.();
      } else {
        setFeedback(data.error || "Xatolik yuz berdi");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadTranslation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !translationFile) return;

    setUploadingTranslation(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", translationFile);
      if (adminNote.trim()) fd.append("adminNote", adminNote.trim());

      const res = await fetch(
        `/api/admin/orders/${selectedOrder.id}/translation`,
        {
          method: "POST",
          body: fd,
        }
      );
      const data = (await res.json()) as { order?: OrderDTO; error?: string };
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
        setNextStatus(data.order.status);
        setTranslationFile(null);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order!.id ? data.order! : o))
        );
        setFeedback(
          "Tayyor tarjima fayli yuklandi! Buyurtma COMPLETED holatiga o‘tkazildi va mijozga bildirishnoma yuborildi."
        );
        onChanged?.();
      } else {
        setFeedback(data.error || "Faylni yuklab bo‘lmadi");
      }
    } finally {
      setUploadingTranslation(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.admin.searchOrdersPlaceholder}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-[#00C896] focus:outline-none"
            >
              <option value="ALL">{t.common.all}</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.statuses[s]}
                </option>
              ))}
            </select>
          </div>

          <a href="/api/admin/orders/export">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              {t.admin.exportExcel}
            </Button>
          </a>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {t.common.loading}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead className="bg-slate-100 text-xs sm:text-[13px] uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">#</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">Mijoz</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">{t.orderWizard.service}</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">{t.orderWizard.direction}</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold text-center">{t.orderWizard.pageCount}</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">{t.orderWizard.totalPrice}</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">Status</th>
                  <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold text-center">Boshqarish</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={
                      order.isNew
                        ? "bg-rose-50/45 hover:bg-rose-50/80 dark:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-colors"
                        : "odd:bg-white even:bg-slate-50/60 hover:bg-[#00C896]/5 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 dark:hover:bg-[#00C896]/10 transition-colors"
                    }
                  >
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 font-mono text-sm font-bold text-[#1F4E79] dark:text-[#00C896] whitespace-nowrap">
                      #{order.orderNumber}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-[15px]">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatUzPhone(order.user?.phone)}
                      </p>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4">
                      {order.isNew && (
                        <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          {newBadgeLabel}
                        </span>
                      )}
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-[15px]">
                        {getServiceLocalizedName(order.service, locale)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]">
                        {order.originalFileName}
                      </p>
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDirection(order.sourceLanguage, order.targetLanguage, locale)}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
                      {order.pageCount}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 font-bold text-slate-900 dark:text-slate-100 text-[15px] whitespace-nowrap">
                      {formatUZS(order.totalPrice, locale)}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4">
                      <StatusBadge status={order.status} className="px-3 py-1 text-xs" />
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 px-4"
                        onClick={() => openOrderModal(order)}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        {t.common.view}
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border border-slate-200 dark:border-slate-700 py-14 text-center text-base text-slate-400"
                    >
                      Buyurtmalar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Detail & Management Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Buyurtma #${selectedOrder.orderNumber}` : ""}
        subtitle={
          selectedOrder
            ? `${selectedOrder.user?.firstName ?? ""} ${selectedOrder.user?.lastName ?? ""} • ${formatUzPhone(selectedOrder.user?.phone)}`
            : undefined
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {feedback && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                {feedback}
              </div>
            )}

            {/* Order Info Grid */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.orderWizard.service}</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {getServiceLocalizedName(selectedOrder.service, locale)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.orderWizard.direction}</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDirection(
                    selectedOrder.sourceLanguage,
                    selectedOrder.targetLanguage,
                    locale
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.orderWizard.pageCount}</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedOrder.pageCount} {t.common.pages} ×{" "}
                  {formatUZS(selectedOrder.unitPrice, locale)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.orderWizard.totalPrice}</span>
                <p className="text-base font-bold text-[#1F4E79] dark:text-[#00C896]">
                  {formatUZS(selectedOrder.totalPrice, locale)}
                </p>
              </div>
              {selectedOrder.customerNote && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Mijoz izohi:</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedOrder.customerNote}</p>
                </div>
              )}
              {selectedOrder.user?.telegramChatId && (
                <div className="sm:col-span-2 flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400">
                  <Bot className="h-4 w-4" />
                  Telegram bot ulangan — holat va tayyor fayl avtomatik Telegramga boradi.
                </div>
              )}
            </div>

            {/* Files */}
            <div className="flex flex-wrap gap-2.5">
              {getFileDownloadUrl(selectedOrder.originalFileKey) && (
                <a
                  href={getFileDownloadUrl(selectedOrder.originalFileKey)!}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 text-[#1F4E79] dark:text-[#00C896]" />
                    {t.dashboard.originalDoc} ({selectedOrder.originalFileName})
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
              )}

              {selectedOrder.payments
                .filter((p) => p.receiptFileKey)
                .map((p) => (
                  <a
                    key={p.id}
                    href={`${getFileDownloadUrl(p.receiptFileKey)!}?inline=1`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4 text-amber-500" />
                      {t.dashboard.receiptDoc}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                ))}

              {getFileDownloadUrl(selectedOrder.translatedFileKey) && (
                <a
                  href={getFileDownloadUrl(selectedOrder.translatedFileKey)!}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400">
                    <Download className="h-4 w-4" />
                    {t.dashboard.translatedDoc} ({selectedOrder.translatedFileName})
                  </Button>
                </a>
              )}
            </div>

            {/* Update Status Form */}
            <form
              onSubmit={handleUpdateOrder}
              className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800/40 p-4"
            >
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.admin.updateStatus}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-[#00C896] focus:outline-none"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.statuses[s]} ({s})
                    </option>
                  ))}
                </select>
                <Button type="submit" loading={saving} className="bg-[#00C896] hover:bg-[#00B085]">
                  {t.common.save}
                </Button>
              </div>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={t.admin.adminNote}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 focus:border-[#00C896] focus:outline-none"
              />
            </form>

            {/* Upload Finished Translation Form */}
            <form
              onSubmit={handleUploadTranslation}
              className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <FileUp className="h-4 w-4" />
                <h4 className="text-sm font-semibold">{t.admin.attachTranslation}</h4>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">{t.admin.attachTranslationHint}</p>
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,.rtf,.txt,.zip"
                onChange={(e) => setTranslationFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-emerald-500/40 dark:bg-slate-800 dark:text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-emerald-700"
              />
              <Button
                type="submit"
                disabled={!translationFile}
                loading={uploadingTranslation}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t.admin.uploadTranslationBtn}
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
