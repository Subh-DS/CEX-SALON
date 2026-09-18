import type { TimeSlot } from "@/types";
import { cn } from "@/lib/utils";

export function formatSlot12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Time grid: 12-hour labels, plum selection, struck-through unavailable. */
export default function SlotPicker({
  slots,
  selected,
  onSelect,
}: {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Available times">
      {slots.map((s) => (
        <button
          key={s.time}
          role="radio"
          aria-checked={selected === s.time}
          aria-label={`${formatSlot12h(s.time)}${s.available ? "" : ", unavailable"}`}
          disabled={!s.available}
          onClick={() => onSelect(s.time)}
          className={cn(
            "min-h-[48px] border text-sm font-semibold transition-colors",
            selected === s.time
              ? "border-primary bg-primary text-ivory"
              : "border-ink/15 bg-white text-ink hover:border-ink/40",
            !s.available && "cursor-not-allowed bg-ink/[0.03] text-ink/30 line-through hover:border-ink/15"
          )}
        >
          {formatSlot12h(s.time)}
        </button>
      ))}
    </div>
  );
}
