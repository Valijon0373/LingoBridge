import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Locale = "uz" | "ru" | "en";
export type LanguageCode = "UZ" | "RU" | "EN";

export function localeToLanguageEnum(locale: Locale): LanguageCode {
  return locale.toUpperCase() as LanguageCode;
}

export function languageEnumToLocale(lang: string | null | undefined): Locale {
  const lower = (lang ?? "uz").toLowerCase();
  if (lower === "ru" || lower === "en" || lower === "uz") {
    return lower;
  }
  return "uz";
}

/**
 * Normalizes any Uzbek phone input (e.g. "+998 90 123 45 67", "998901234567", "901234567")
 * to canonical "+998XXXXXXXXX" format, or returns null if invalid.
 */
export function normalizeUzPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return null;
}

/**
 * Formats "+998901234567" -> "+998 90 123 45 67"
 */
export function formatUzPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const normalized = normalizeUzPhone(phone);
  if (!normalized) return phone;
  const d = normalized.slice(1); // 998901234567
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

/**
 * Formats input while typing into "+998 XX XXX XX XX"
 */
export function formatUzPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9);

  if (digits.length === 0) return "+998 ";
  let formatted = "+998 ";
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += " " + digits.slice(2, 5);
  if (digits.length > 5) formatted += " " + digits.slice(5, 7);
  if (digits.length > 7) formatted += " " + digits.slice(7, 9);
  return formatted;
}

/**
 * Formats amount in UZS so'm with clean space thousands separators.
 */
export function formatUZS(amount: number, locale: Locale = "uz"): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(Math.round(amount));
  const suffix = locale === "en" ? "UZS" : locale === "ru" ? "сум" : "so‘m";
  return `${formatted} ${suffix}`;
}

export interface TranslationDirection {
  id: string;
  source: LanguageCode;
  target: LanguageCode;
}

export const TRANSLATION_DIRECTIONS: TranslationDirection[] = [
  { id: "UZ-RU", source: "UZ", target: "RU" },
  { id: "RU-UZ", source: "RU", target: "UZ" },
  { id: "UZ-EN", source: "UZ", target: "EN" },
  { id: "EN-UZ", source: "EN", target: "UZ" },
  { id: "RU-EN", source: "RU", target: "EN" },
  { id: "EN-RU", source: "EN", target: "RU" },
];

export const LANGUAGE_LABELS: Record<Locale, Record<LanguageCode, string>> = {
  uz: { UZ: "O‘zbek", RU: "Rus", EN: "Ingliz" },
  ru: { UZ: "Узбекский", RU: "Русский", EN: "Английский" },
  en: { UZ: "Uzbek", RU: "Russian", EN: "English" },
};

export function formatDirection(
  source: LanguageCode,
  target: LanguageCode,
  locale: Locale = "uz"
): string {
  const map = LANGUAGE_LABELS[locale] ?? LANGUAGE_LABELS.uz;
  return `${map[source] ?? source} → ${map[target] ?? target}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const dayCode = String(now.getDate()).padStart(2, "0");
  return `LB-${dayCode}${suffix}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['‘’`"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Server-only deterministic price calculator.
 * Never trust totals coming from the client.
 */
export function calculateOrderPrice(
  unitPrice: number,
  pricingType: "PER_PAGE" | "FIXED",
  pageCount: number
): { normalizedPages: number; totalPrice: number } {
  const normalizedPages = pricingType === "FIXED" ? 1 : Math.max(1, Math.floor(pageCount));
  const totalPrice = pricingType === "FIXED" ? unitPrice : unitPrice * normalizedPages;
  return { normalizedPages, totalPrice };
}

export function getFileDownloadUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}
