import { createPortal } from "react-dom";
import { BOOKING_STEPS } from "./Stepper";
import { formatINR } from "@/lib/utils";

/** Mobile: compact step indicator + sticky action bar with live total. */
export function MobileStepHead({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / BOOKING_STEPS.length) * 100);
  return (
    <div className="mb-5 lg:hidden">
      <p className="font-accent text-[13px] font-bold uppercase tracking-[0.14em] text-ink/60">
        Step {step + 1} of {BOOKING_STEPS.length} · {BOOKING_STEPS[step]}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Booking progress">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MobileBar({
  total,
  canNext,
  busy,
  nextLabel,
  onNext,
}: {
  total: number | null;
  canNext: boolean;
  busy: boolean;
  nextLabel: string;
  onNext: () => void;
}) {
  // Portalled: ancestors use transforms (full-bleed layout), which would
  // break position:fixed if rendered inline.
  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-ivory pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <span className="flex-1 font-accent text-sm text-ink/70">
          {total !== null ? (
            <>Total <b className="text-ink">{formatINR(total)}</b></>
          ) : (
            "Choose to see your total"
          )}
        </span>
        <button
          onClick={onNext}
          disabled={!canNext || busy}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center bg-primary px-6 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep disabled:opacity-40"
        >
          {busy ? "Working…" : nextLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}
