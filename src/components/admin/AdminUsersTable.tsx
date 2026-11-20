"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RiGroupLine,
  RiTelegramFill,
  RiShieldUserLine,
  RiLoader4Line,
  RiPencilLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatUzPhone, formatUzPhoneInput } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AdminUserRow {
  id: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  language: "UZ" | "RU" | "EN";
  telegramUsername: string | null;
  telegramChatId: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export function AdminUsersTable({ darkMode = false }: { darkMode?: boolean }) {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998 ",
    role: "USER" as "USER" | "ADMIN",
    language: "UZ" as "UZ" | "RU" | "EN",
    isActive: true,
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirm modal state
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Result notification modal state
  const [resultModal, setResultModal] = useState<{
    title: string;
    message: string;
    variant: "success" | "danger";
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { users: AdminUserRow[] };
        setUsers(data.users ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openEditModal(u: AdminUserRow) {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      phone: formatUzPhone(u.phone),
      role: u.role,
      language: u.language,
      isActive: u.isActive,
      newPassword: "",
    });
    setEditError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = (await res.json()) as { user?: AdminUserRow; error?: string };
      if (!res.ok || !data.user) {
        setEditError(data.error || "Foydalanuvchini yangilab bo‘lmadi");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === data.user!.id ? data.user! : u))
      );
      const updatedName = `${data.user.firstName} ${data.user.lastName}`.trim();
      setEditingUser(null);
      setResultModal({
        title: "Foydalanuvchi tahrirlandi",
        message: `"${updatedName}" ma’lumotlari muvaffaqiyatli yangilandi.`,
        variant: "success",
      });
    } catch {
      setEditError("Server bilan aloqa uzildi");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingUser) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setDeleteError(data.error || "Foydalanuvchini o‘chirib bo‘lmadi");
        return;
      }

      const removedName = `${deletingUser.firstName} ${deletingUser.lastName}`.trim();
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      setResultModal({
        title: "Foydalanuvchi o‘chirildi",
        message: `"${removedName}" tizimdan muvaffaqiyatli o‘chirildi.`,
        variant: "danger",
      });
    } catch {
      setDeleteError("Server bilan aloqa uzildi");
    } finally {
      setDeleting(false);
    }
  }

  const cardBg = darkMode
    ? "bg-slate-900 border-slate-700 text-slate-100"
    : "bg-white border-slate-300 text-slate-900";

  return (
    <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg}`}>
      <div
        className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <RiGroupLine className="h-5 w-5 text-[#00C896]" />
          <h2 className="text-base font-semibold">Ro‘yxatdan o‘tgan foydalanuvchilar</h2>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Jami: {users.length} ta
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
          <RiLoader4Line className="h-5 w-5 animate-spin mr-2" />
          Yuklanmoqda...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead
              className={`text-xs sm:text-[13px] uppercase tracking-wide ${
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <tr>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">
                  F.I.Sh.
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">
                  Telefon
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">
                  Rol
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold text-center">
                  Til
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold text-center">
                  Buyurtmalar
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">
                  Telegram
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold">
                  Ro‘yxatdan o‘tgan
                </th>
                <th className="border border-slate-300 dark:border-slate-700 px-5 py-4 font-semibold text-center">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentAdmin?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className="odd:bg-white even:bg-slate-50/60 hover:bg-[#00C896]/5 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 dark:hover:bg-[#00C896]/10 transition-colors"
                  >
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 font-semibold">
                      <span>
                        {u.firstName} {u.lastName}
                      </span>
                      {!u.isActive && (
                        <span className="ml-2 rounded-full bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                          Nofaol
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 font-mono text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatUzPhone(u.phone)}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          <RiShieldUserLine className="h-3.5 w-3.5" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-sm font-medium text-center">
                      {u.language}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 font-bold text-[#00C896] text-center">
                      {u._count.orders}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-sm">
                      {u.telegramChatId ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                          <RiTelegramFill className="h-4 w-4" />
                          {u.telegramUsername ? `@${u.telegramUsername}` : "Ulangan"}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-700 px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap"
                        >
                          <RiPencilLine className="h-4 w-4 shrink-0" />
                          <span>Tahrirlash</span>
                        </button>

                        <button
                          type="button"
                          disabled={isSelf}
                          title={isSelf ? "O‘z hisobingizni o‘chira olmaysiz" : "O‘chirish"}
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingUser(u);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-400 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 cursor-pointer whitespace-nowrap"
                        >
                          <RiDeleteBinLine className="h-4 w-4 shrink-0" />
                          <span>O‘chirish</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-slate-200 dark:border-slate-700 py-12 text-center text-sm text-slate-400"
                  >
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        open={Boolean(editingUser)}
        onClose={() => !saving && setEditingUser(null)}
        maxWidthClass="max-w-lg"
        title="Foydalanuvchini tahrirlash"
        subtitle={editingUser ? formatUzPhone(editingUser.phone) : undefined}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/15 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              {editError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ism
              </label>
              <input
                required
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Familiya
              </label>
              <input
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Telefon raqam
              </label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone: formatUzPhoneInput(e.target.value),
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Til
              </label>
              <select
                value={editForm.language}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    language: e.target.value as "UZ" | "RU" | "EN",
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="UZ">🇺🇿 O‘zbek (UZ)</option>
                <option value="RU">🇷🇺 Rus (RU)</option>
                <option value="EN">🇬🇧 Ingliz (EN)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Rol
              </label>
              <select
                value={editForm.role}
                disabled={currentAdmin?.id === editingUser?.id}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value as "USER" | "ADMIN",
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="USER">USER (Mijoz)</option>
                <option value="ADMIN">ADMIN (Administrator)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Yangi parol (ixtiyoriy)
              </label>
              <input
                type="password"
                value={editForm.newPassword}
                onChange={(e) =>
                  setEditForm({ ...editForm, newPassword: e.target.value })
                }
                placeholder="O‘zgartirmaslik uchun bo‘sh qoldiring"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              disabled={currentAdmin?.id === editingUser?.id}
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm({ ...editForm, isActive: e.target.checked })
              }
              className="rounded border-slate-300 dark:border-slate-600"
            />
            Faol hisob
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setEditingUser(null)}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              loading={saving}
              className="bg-[#00C896] hover:bg-[#00B085] text-white"
            >
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingUser)}
        onClose={() => !deleting && setDeletingUser(null)}
        maxWidthClass="max-w-md"
        title="Foydalanuvchini o‘chirish"
      >
        {deletingUser && (
          <div className="space-y-5">
            {deleteError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/15 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <RiErrorWarningLine className="h-6 w-6" />
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {deletingUser.firstName} {deletingUser.lastName} (
                  {formatUzPhone(deletingUser.phone)})
                </p>
                <p className="mt-1">
                  {deletingUser._count.orders > 0
                    ? `Diqqat! Ushbu foydalanuvchining ${deletingUser._count.orders} ta buyurtmasi mavjud. O‘chirilganda uning barcha buyurtmalari va bildirishnomalari ham o‘chiriladi.`
                    : "Ushbu foydalanuvchini tizimdan butunlay o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setDeletingUser(null)}
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={deleting}
                onClick={handleConfirmDelete}
              >
                Ha, o‘chirish
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                resultModal.variant === "danger"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              }`}
            >
              {resultModal.variant === "danger" ? (
                <RiDeleteBinLine className="h-7 w-7" />
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
