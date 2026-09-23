import { formatINR } from "@/lib/utils";

export type PaymentMethod = "upi" | "card" | "cash";
export type PaymentPhase = "form" | "processing" | "success" | "failed";
/** Demo outcome control — simulated locally, never a real charge. */
export type DemoOutcome = "success" | "fail";

export interface Coupon {
  code: string;
  label: string;
  type: "flat" | "percent";
  value: number;
}

export const COUPONS: Coupon[] = [
  { code: "BLUSH100", label: "Flat ₹100 off", type: "flat", value: 100 },
  { code: "WELCOME20", label: "20% off your visit", type: "percent", value: 20 },
];

export interface PriceBreakup {
  servicePrice: number;
  addOnPrice: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function calcPrice(servicePrice: number, addOnPrice: number, coupon: Coupon | null): PriceBreakup {
  const subtotal = servicePrice + addOnPrice;
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "flat" ? coupon.value : Math.round((subtotal * coupon.value) / 100);
    discount = Math.min(discount, subtotal);
  }
  const tax = 0;
  return { servicePrice, addOnPrice, subtotal, discount, tax, total: Math.max(0, subtotal - discount + tax) };
}

export function findCoupon(code: string): Coupon | null {
  const needle = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === needle) ?? null;
}

/* ---------- Formatting ---------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-09-24" -> "24 September 2026" */
export function formatLongDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!y || !m || !d) return dateISO;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "16:30" -> "4:30 PM" */
export function formatTime12(slot: string): string {
  const [h, min] = slot.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(min)) return slot;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(min).padStart(2, "0")} ${ampm}`;
}

export { formatINR };

/* ---------- UPI ---------- */

const UPI_RE = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export function isValidUpiId(v: string): boolean {
  return UPI_RE.test(v.trim());
}

export function upiDisplayName(v: string): string {
  return v.trim().split("@")[0].replace(/[._-]+/g, " ").trim() || "UPI user";
}

/* ---------- Card ---------- */

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "RuPay" | "Card";

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(60|65|81|82)/.test(digits)) return "RuPay";
  return "Card";
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function luhnOk(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 15 || digits.length > 16) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function isValidExpiry(raw: string, now: Date = new Date()): boolean {
  const m = raw.replace(/\D/g, "");
  if (m.length !== 4) return false;
  const mm = Number(m.slice(0, 2));
  const yy = 2000 + Number(m.slice(2));
  if (mm < 1 || mm > 12) return false;
  // Valid through the last day of the month.
  const end = new Date(yy, mm, 0, 23, 59, 59);
  return end >= now;
}

export function isValidCvv(raw: string): boolean {
  return /^\d{3,4}$/.test(raw.trim());
}

/* ---------- Demo ids ---------- */

/** "TXN20260924182345"-style demo transaction id. */
export function makeTxnId(at: Date = new Date()): string {
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  const stamp = `${at.getFullYear()}${p(at.getMonth() + 1)}${p(at.getDate())}${p(at.getHours())}${p(
    at.getMinutes()
  )}${p(at.getSeconds())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN${stamp}${rand}`;
}

/* ---------- Add-to-calendar (.ics download, demo) ---------- */

export function downloadIcs(opts: { service: string; dateISO: string; slot: string; durationMin: number }): void {
  const [y, mo, d] = opts.dateISO.split("-").map(Number);
  const [h, mi] = opts.slot.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  const endDate = new Date(y, mo - 1, d, h, mi + opts.durationMin);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(
    endDate.getHours()
  )}${pad(endDate.getMinutes())}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:The Blush Studio — ${opts.service}`,
    "LOCATION:The Blush Studio\\, Patia\\, Bhubaneswar",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "blush-studio-appointment.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
