"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RiPencilLine,
  RiLoader4Line,
  RiAddLine,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import type { PricingType } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { formatUZS } from "@/lib/utils";
import type { ServiceDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const EMPTY_FORM = {
  nameUz: "",
  nameRu: "",
  nameEn: "",
  descriptionUz: "",
  descriptionRu: "",
  descriptionEn: "",
  price: 30000,
  pricingType: "PER_PAGE" as PricingType,
  isActive: true,
  sortOrder: 0,
};

export function AdminServicesManager() {
  const { locale, t } = useI18n();
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    title: string;
    message: string;
    variant: "success" | "warning" | "danger";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | "delete";
    service: ServiceDTO;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { services: ServiceDTO[] };
        setServices(data.services);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(svc: ServiceDTO) {
    setEditingId(svc.id);
    setForm({
      nameUz: svc.nameUz,
      nameRu: svc.nameRu,
      nameEn: svc.nameEn,
      descriptionUz: svc.descriptionUz,
      descriptionRu: svc.descriptionRu,
      descriptionEn: svc.descriptionEn,
      price: svc.price,
      pricingType: svc.pricingType,
      isActive: svc.isActive,
      sortOrder: svc.sortOrder,
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : "/api/admin/services";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Saqlashda xatolik");
        return;
      }
      setModalOpen(false);
      await loadServices();
      setResultModal({
        title: editingId ? "Xizmat tahrirlandi" : "Yangi xizmat qo‘shildi",
        message: editingId
          ? `"${form.nameUz}" xizmati ma’lumotlari muvaffaqiyatli yangilandi.`
          : `"${form.nameUz}" xizmati katalogga muvaffaqiyatli qo‘shildi.`,
        variant: "success",
      });
    } finally {
      setSaving(false);
    }
  }

  async function executeConfirmAction() {
    if (!confirmAction) return;
    const { type, service: svc } = confirmAction;
    setConfirming(true);

    try {
      if (type === "toggle") {
        const res = await fetch(`/api/admin/services/${svc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !svc.isActive }),
        });
        if (res.ok) {
          setServices((prev) =>
            prev.map((s) => (s.id === svc.id ? { ...s, isActive: !s.isActive } : s))
          );
          setConfirmAction(null);
          setResultModal({
            title: svc.isActive ? "Xizmat to‘xtatildi" : "Xizmat faollashtirildi",
            message: svc.isActive
              ? `"${svc.nameUz}" xizmati vaqtincha to‘xtatildi.`
              : `"${svc.nameUz}" xizmati qayta faollashtirildi.`,
            variant: svc.isActive ? "warning" : "success",
          });
        }
      } else {
        const res = await fetch(`/api/admin/services/${svc.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const data = (await res.json()) as { softDeleted?: boolean };
          setConfirmAction(null);
          await loadServices();
          setResultModal({
            title: data.softDeleted ? "Xizmat nofaol qilindi" : "Xizmat o‘chirildi",
            message: data.softDeleted
              ? `"${svc.nameUz}" xizmatida mavjud buyurtmalar borligi sababli tarix saqlanib, nofaol holatga o‘tkazildi.`
              : `"${svc.nameUz}" xizmati tizimdan muvaffaqiyatli o‘chirildi.`,
            variant: data.softDeleted ? "warning" : "danger",
          });
        }
      }
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.admin.navServices}</h2>
        <Button
          onClick={openCreate}
          className="bg-[#00C896] hover:bg-[#00B085] text-white"
        >
          <RiAddLine className="h-4 w-4" />
          {t.admin.addService}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
          <RiLoader4Line className="h-5 w-5 animate-spin mr-2" />
          {t.common.loading}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      svc.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                    }`}
                  >
                    {svc.isActive ? t.admin.active : "To‘xtatilgan"}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {svc.pricingType}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">{svc.nameUz}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  RU: {svc.nameRu} • EN: {svc.nameEn}
                </p>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {svc.descriptionUz}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-[#1F4E79] dark:text-[#00C896]">
                    {formatUZS(svc.price, locale)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {svc._count?.orders ?? 0} buyurtma
                  </span>
                </div>

                {/* 3 Outlined Action Buttons matching screenshot style */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(svc)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-300 bg-white px-2.5 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 cursor-pointer"
                  >
                    <RiPencilLine className="h-4 w-4 shrink-0" />
                    <span className="truncate">Tahrirlash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmAction({ type: "toggle", service: svc })}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-md border bg-white px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      svc.isActive
                        ? "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        : "border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                    }`}
                  >
                    {svc.isActive ? (
                      <>
                        <RiPauseCircleLine className="h-4 w-4 shrink-0" />
                        <span className="truncate">To‘xtatish</span>
                      </>
                    ) : (
                      <>
                        <RiPlayCircleLine className="h-4 w-4 shrink-0" />
                        <span className="truncate">Yoqish</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmAction({ type: "delete", service: svc })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-rose-300 bg-white px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-400 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 cursor-pointer"
                  >
                    <RiDeleteBinLine className="h-4 w-4 shrink-0" />
                    <span className="truncate">O‘chirish</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t.admin.editService : t.admin.addService}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nomi (UZ)
              </label>
              <input
                required
                value={form.nameUz}
                onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Название (RU)
              </label>
              <input
                required
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name (EN)
              </label>
              <input
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tavsif (UZ)
              </label>
              <textarea
                rows={2}
                required
                value={form.descriptionUz}
                onChange={(e) => setForm({ ...form, descriptionUz: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Описание (RU)
              </label>
              <textarea
                rows={2}
                required
                value={form.descriptionRu}
                onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description (EN)
              </label>
              <textarea
                rows={2}
                required
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Narx (so‘m)
              </label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Narx turi
              </label>
              <select
                value={form.pricingType}
                onChange={(e) =>
                  setForm({ ...form, pricingType: e.target.value as PricingType })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="PER_PAGE">PER_PAGE (sahifa boshiga)</option>
                <option value="FIXED">FIXED (qat’iy narx)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tartib raqami
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            {t.admin.active}
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Pause/Activate & Delete */}
      <Modal
        open={Boolean(confirmAction)}
        onClose={() => !confirming && setConfirmAction(null)}
        maxWidthClass="max-w-md"
        title={
          confirmAction?.type === "delete"
            ? "Xizmatni o‘chirish"
            : confirmAction?.service.isActive
              ? "Xizmatni to‘xtatish"
              : "Xizmatni qayta yoqish"
        }
      >
        {confirmAction && (
          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  confirmAction.type === "delete"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                    : confirmAction.service.isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                }`}
              >
                {confirmAction.type === "delete" ? (
                  <RiErrorWarningLine className="h-6 w-6" />
                ) : confirmAction.service.isActive ? (
                  <RiPauseCircleLine className="h-6 w-6" />
                ) : (
                  <RiPlayCircleLine className="h-6 w-6" />
                )}
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmAction.service.nameUz}
                </p>
                {confirmAction.type === "delete" ? (
                  <p className="mt-1">
                    {(confirmAction.service._count?.orders ?? 0) > 0
                      ? `Ushbu xizmatda ${confirmAction.service._count?.orders} ta mavjud buyurtma bor. O‘chirish tasdiqlanganda tarix saqlanishi uchun xizmat nofaol holatga o‘tkaziladi.`
                      : "Ushbu xizmatni butunlay o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi."}
                  </p>
                ) : confirmAction.service.isActive ? (
                  <p className="mt-1">
                    Ushbu xizmatni vaqtincha to‘xtatmoqchimisiz? To‘xtatilgan xizmat
                    mijozlarga buyurtma berish oynasida ko‘rinmaydi.
                  </p>
                ) : (
                  <p className="mt-1">
                    Ushbu xizmatni qayta faollashtirmoqchimisiz? Xizmat mijozlar
                    katalogida yana faol ko‘rinadi.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={confirming}
                onClick={() => setConfirmAction(null)}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                variant={confirmAction.type === "delete" ? "danger" : "primary"}
                loading={confirming}
                onClick={executeConfirmAction}
                className={
                  confirmAction.type === "toggle"
                    ? confirmAction.service.isActive
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-[#00C896] hover:bg-[#00B085]"
                    : undefined
                }
              >
                {confirmAction.type === "delete"
                  ? "Ha, o‘chirish"
                  : confirmAction.service.isActive
                    ? "Ha, to‘xtatish"
                    : "Ha, yoqish"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Result Notification Modal (after Edit / Pause / Delete) */}
      <Modal
        open={Boolean(resultModal)}
        onClose={() => setResultModal(null)}
        maxWidthClass="max-w-sm"
        title={resultModal?.title || "Bildirishnoma"}
      >
        {resultModal && (
          <div className="text-center space-y-4 py-2">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                resultModal.variant === "danger"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  : resultModal.variant === "warning"
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              }`}
            >
              {resultModal.variant === "danger" ? (
                <RiDeleteBinLine className="h-7 w-7" />
              ) : resultModal.variant === "warning" ? (
                <RiPauseCircleLine className="h-7 w-7" />
              ) : (
                <RiCheckboxCircleLine className="h-7 w-7" />
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {resultModal.message}
            </p>

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setResultModal(null)}
                className="w-full bg-[#00C896] hover:bg-[#00B085] text-white"
              >
                Tushunarli
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
