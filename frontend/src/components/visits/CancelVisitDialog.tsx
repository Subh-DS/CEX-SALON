import { useEffect, useRef } from "react";
import { parseVisitDate } from "./dates";

/** Accessible confirm-cancel dialog: Escape closes, focus starts on Keep. */
export default function CancelVisitDialog({
  serviceName,
  staffName,
  iso,
  busy,
  error,
  onKeep,
  onConfirm,
}: {
  serviceName: string;
  staffName: string;
  iso: string;
  busy: boolean;
  error: string | null;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const keepRef = useRef<HTMLButtonElement>(null);
  const d = parseVisitDate(iso);

  useEffect(() => {
    keepRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKeep();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKeep]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onKeep}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        aria-describedby="cancel-desc"
        className="w-full max-w-md bg-white p-7 shadow-lg2"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="cancel-title" className="font-display text-2xl font-medium text-ink">
          Cancel this appointment?
        </h3>
        <p id="cancel-desc" className="mt-3 text-[15px] leading-relaxed text-ink/70">
          {serviceName} with {staffName}
          <br />
          {d.full} · {d.time}
        </p>
        <p className="mt-2 text-sm text-ink/55">
          Free cancellation up to 4 hours before. Are you sure?
        </p>
        {error && (
          <p role="alert" className="mt-3 bg-[#f7e8e8] px-3 py-2 text-sm text-[#b84444]">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={keepRef}
            onClick={onKeep}
            className="inline-flex min-h-[48px] items-center justify-center border border-ink px-6 font-accent text-sm font-semibold text-ink hover:bg-ink hover:text-ivory"
          >
            Keep appointment
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex min-h-[48px] items-center justify-center bg-[#b84444] px-6 font-accent text-sm font-semibold text-white hover:bg-[#9c3434] disabled:opacity-60"
          >
            {busy ? "Cancelling…" : "Cancel appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
