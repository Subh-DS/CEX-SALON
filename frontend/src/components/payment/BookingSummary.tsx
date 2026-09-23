import { useState } from "react";
import { BadgePercent, Building2, Lock, ShieldCheck } from "lucide-react";
import { findCoupon, formatINR, formatLongDate, formatTime12, type Coupon, type PriceBreakup } from "./utils";

export default function BookingSummary({
  serviceName,
  durationMin,
  staffName,
  dateISO,
  slot,
  price,
  coupon,
  onCoupon,
}: {
  serviceName: string;
  durationMin: number;
  staffName: string;
  dateISO: string;
  slot: string;
  price: PriceBreakup;
  coupon: Coupon | null;
  onCoupon: (c: Coupon | null) => void;
}) {
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  function apply() {
    const found = findCoupon(code);
    if (!found) {
      setCouponError(`“${code.trim().toUpperCase()}” isn't a valid code. Try BLUSH100.`);
      return;
    }
    setCouponError(null);
    onCoupon(found);
    setCode("");
  }

  return (
    <aside
      aria-label="Booking summary"
      className="overflow-hidden rounded-md2 border border-warmborder bg-white shadow-sm2 lg:sticky lg:top-24"
    >
      <div className="bg-primary px-5 py-4 text-ivory">
        <p className="flex items-center gap-2 font-accent text-[11px] font-bold uppercase tracking-[0.18em] text-ivory/65">
          <Building2 className="h-3.5 w-3.5" />
          The Blush Studio
        </p>
        <p className="mt-1 font-display text-xl leading-snug">{serviceName}</p>
      </div>

      <dl className="space-y-2.5 px-5 pt-4 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink/50">Professional</dt>
          <dd className="font-semibold text-ink">{staffName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink/50">Date</dt>
          <dd className="font-semibold text-ink">{formatLongDate(dateISO)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink/50">Time</dt>
          <dd className="font-semibold text-ink">{formatTime12(slot)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink/50">Duration</dt>
          <dd className="font-semibold text-ink">{durationMin} min</dd>
        </div>
      </dl>

      <div className="mx-5 mb-1 mt-4 border-t border-warmborder pt-4">
        <p className="flex items-center gap-1.5 font-accent text-[13px] font-bold text-ink">
          <BadgePercent className="h-4 w-4 text-marigold-deep" />
          Promo code
        </p>
        {coupon ? (
          <p className="mt-2 flex items-center justify-between gap-2 rounded-sm2 bg-[#e3efe8] px-3 py-2.5 text-sm">
            <span>
              <b className="font-accent text-ink">{coupon.code}</b>
              <span className="block text-[13px] text-leafgreen">✓ {coupon.label} — you saved {formatINR(price.discount)}</span>
            </span>
            <button
              onClick={() => onCoupon(null)}
              aria-label={`Remove coupon ${coupon.code}`}
              className="shrink-0 rounded-pill px-2 py-1 text-[13px] font-semibold text-ink/60 hover:text-ink"
            >
              Remove
            </button>
          </p>
        ) : (
          <>
            <div className="mt-2 flex gap-2">
              <label className="sr-only" htmlFor="promo-code">Promo code</label>
              <input
                id="promo-code"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCouponError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
                placeholder="BLUSH100"
                autoComplete="off"
                className="min-h-[44px] w-full min-w-0 flex-1 rounded-sm2 border border-warmborder bg-ivory/60 px-3 uppercase text-sm tracking-wide text-ink placeholder:text-ink/35 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light/40"
              />
              <button
                onClick={apply}
                disabled={!code.trim()}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-sm2 bg-ink px-4 font-accent text-sm font-semibold text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
            {couponError ? (
              <p role="alert" className="mt-1.5 text-[13px] text-[#b84444]">{couponError}</p>
            ) : (
              <p className="mt-1.5 text-[13px] text-ink/45">Try BLUSH100 or WELCOME20</p>
            )}
          </>
        )}
      </div>

      <dl aria-label="Price breakdown" className="space-y-1.5 px-5 py-4 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink/60">Service</dt>
          <dd className="text-ink">{formatINR(price.servicePrice)}</dd>
        </div>
        {price.addOnPrice > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink/60">Add-ons</dt>
            <dd className="text-ink">{formatINR(price.addOnPrice)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-ink/60">Subtotal</dt>
          <dd className="text-ink">{formatINR(price.subtotal)}</dd>
        </div>
        {price.discount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-leafgreen">Discount{coupon ? ` (${coupon.code})` : ""}</dt>
            <dd className="font-semibold text-leafgreen">−{formatINR(price.discount)}</dd>
          </div>
        )}
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-warmborder pt-3">
          <dt className="font-accent text-[15px] font-bold text-ink">Total</dt>
          <dd className="font-display text-[26px] leading-none text-ink">{formatINR(price.total)}</dd>
        </div>
      </dl>

      <div className="flex items-start gap-2.5 bg-surfacewarm/70 px-5 py-3.5 text-[13px] leading-relaxed text-ink/60">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-leafgreen" />
        <p>
          <b className="text-ink/80">Secure checkout.</b> Demo only — no real money moves and no
          payment details are stored.
        </p>
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs text-ink/45">
        <ShieldCheck className="h-3.5 w-3.5" />
        No payment information is stored
      </p>
    </aside>
  );
}
