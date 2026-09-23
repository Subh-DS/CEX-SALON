import { CircleAlert, Info } from "lucide-react";
import { formatINR } from "./utils";

export default function CashPayment({
  amount,
  onConfirm,
}: {
  amount: number;
  onConfirm: () => void;
}) {
  return (
    <div>
      <div className="rounded-md2 border border-warmborder bg-white p-5">
        <p className="flex items-center gap-2 font-display text-xl text-ink">
          <CircleAlert className="h-5 w-5 text-marigold-deep" />
          Pay at the salon
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/65">
          You can pay in cash when you arrive at The Blush Studio.
        </p>
        <dl className="mt-4 space-y-1.5 border-t border-warmborder pt-4 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink/55">Booking amount</dt>
            <dd className="font-display text-2xl text-ink">{formatINR(amount)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink/55">Payment due</dt>
            <dd className="font-semibold text-ink">At the salon</dd>
          </div>
        </dl>
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-md2 bg-surfacewarm/70 px-4 py-3 text-sm leading-relaxed text-ink/65">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Your appointment is already reserved — payment will be collected at the salon. Please arrive 10 minutes early.
      </p>
      <button
        onClick={onConfirm}
        className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-sm2 bg-primary px-8 font-accent text-[15px] font-semibold text-ivory transition-colors hover:bg-plum-deep max-lg:sticky max-lg:bottom-4"
      >
        Confirm booking · {formatINR(amount)} due at salon
      </button>
    </div>
  );
}
