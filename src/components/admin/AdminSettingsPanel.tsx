"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RiShieldUserLine,
  RiLockPasswordLine,
  RiBankCardLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiSave3Line,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatUzPhone, formatUzPhoneInput } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function AdminSettingsPanel() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998 ",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Platform settings form
  const [platformForm, setPlatformForm] = useState({
    paymentCardNumber: "",
    paymentCardHolder: "",
    paymentCardBank: "",
    supportPhone: "",
    supportTelegram: "",
  });
  const [savingPlatform, setSavingPlatform] = useState(false);

  // Result modal
  const [resultModal, setResultModal] = useState<{
    title: string;
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          admin: { firstName: string; lastName: string; phone: string | null };
          settings: typeof platformForm;
        };
        setProfileForm({
          firstName: data.admin.firstName,
          lastName: data.admin.lastName,
          phone: formatUzPhone(data.admin.phone),
        });
        setPlatformForm(data.settings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "profile", ...profileForm }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setResultModal({
          title: "Xatolik",
          message: data.error || "Profilni saqlab bo‘lmadi",
          variant: "error",
        });
        return;
      }
      await refreshUser();
      setResultModal({
        title: "Profil yangilandi",
        message: "Administrator profil ma’lumotlari muvaffaqiyatli saqlandi.",
        variant: "success",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setResultModal({
        title: "Parollar mos emas",
        message: "Yangi parol va tasdiqlash paroli bir xil bo‘lishi kerak.",
        variant: "error",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setResultModal({
          title: "Xatolik",
          message: data.error || "Parolni o‘zgartirib bo‘lmadi",
          variant: "error",
        });
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setResultModal({
        title: "Parol o‘zgartirildi",
        message: "Yangi administrator paroli muvaffaqiyatli o‘rnatildi.",
        variant: "success",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSavePlatform(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlatform(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "platform", ...platformForm }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setResultModal({
          title: "Xatolik",
          message: data.error || "Platforma sozlamalarini saqlab bo‘lmadi",
          variant: "error",
        });
        return;
      }
      setResultModal({
        title: "Sozlamalar saqlandi",
        message: "Karta rekvizitlari va aloqa ma’lumotlari yangilandi.",
        variant: "success",
      });
    } finally {
      setSavingPlatform(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <RiLoader4Line className="h-6 w-6 animate-spin mr-2" />
        Yuklanmoqda...
      </div>
    );
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20";

  return (
    <div className="space-y-6">
      {/* 1. PROFILE + PASSWORD GRID */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admin Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <RiShieldUserLine className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Administrator profili
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ism
                </label>
                <input
                  required
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, firstName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Familiya
                </label>
                <input
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, lastName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Telefon raqam
              </label>
              <input
                type="tel"
                required
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    phone: formatUzPhoneInput(e.target.value),
                  })
                }
                className={`${inputClass} font-mono`}
              />
            </div>

            <Button
              type="submit"
              loading={savingProfile}
              className="bg-[#00C896] hover:bg-[#00B085] text-white"
            >
              <RiSave3Line className="h-4 w-4" />
              Profilni saqlash
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <RiLockPasswordLine className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Parolni o‘zgartirish
            </h3>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Joriy parol
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Yangi parol
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Yangi parolni tasdiqlang
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <Button type="submit" loading={savingPassword}>
              <RiLockPasswordLine className="h-4 w-4" />
              Parolni yangilash
            </Button>
          </form>
        </Card>
      </div>

      {/* 2. PLATFORM PAYMENT CARD & SUPPORT SETTINGS */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <RiBankCardLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              To‘lov kartasi va aloqa sozlamalari
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buyurtma to‘lov oynasi va aloqa bo‘limida ko‘rsatiladigan rekvizitlar
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePlatform} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Karta raqami
              </label>
              <input
                required
                value={platformForm.paymentCardNumber}
                onChange={(e) =>
                  setPlatformForm({
                    ...platformForm,
                    paymentCardNumber: e.target.value,
                  })
                }
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Karta egasi
              </label>
              <input
                required
                value={platformForm.paymentCardHolder}
                onChange={(e) =>
                  setPlatformForm({
                    ...platformForm,
                    paymentCardHolder: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bank / Tizim
              </label>
              <input
                required
                value={platformForm.paymentCardBank}
                onChange={(e) =>
                  setPlatformForm({
                    ...platformForm,
                    paymentCardBank: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Qo‘llab-quvvatlash telefoni
              </label>
              <input
                required
                value={platformForm.supportPhone}
                onChange={(e) =>
                  setPlatformForm({ ...platformForm, supportPhone: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Telegram Admin havolasi
              </label>
              <input
                required
                value={platformForm.supportTelegram}
                onChange={(e) =>
                  setPlatformForm({
                    ...platformForm,
                    supportTelegram: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={savingPlatform}
            className="bg-[#00C896] hover:bg-[#00B085] text-white"
          >
            <RiSave3Line className="h-4 w-4" />
            Sozlamalarni saqlash
          </Button>
        </form>
      </Card>

      {/* Result Notification Modal */}
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
                resultModal.variant === "error"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              }`}
            >
              {resultModal.variant === "error" ? (
                <RiErrorWarningLine className="h-7 w-7" />
              ) : (
                <RiCheckboxCircleLine className="h-7 w-7" />
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {resultModal.message}
            </p>
            <Button
              type="button"
              onClick={() => setResultModal(null)}
              className="w-full bg-[#00C896] hover:bg-[#00B085] text-white"
            >
              Tushunarli
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
