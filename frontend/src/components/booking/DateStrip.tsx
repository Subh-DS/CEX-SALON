const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 14-day strip. Sundays are honestly disabled (staff work Mon–Sat per
 * staff_availability seed). Real per-slot availability still comes from
 * GET /availability on the Time step.
 */
export default function DateStrip({
  value,
  onChange,
  days = 14,
}: {
  value: string;
  onChange: (iso: string) => void;
  days?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list: { date: Date; iso: string; closed: boolean; label: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const sunday = d.getDay() === 0;
    list.push({
      date: d,
      iso: toISO(d),
      closed: sunday,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : DAYS[d.getDay()],
    });
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Choose a date">
        {list.slice(0, 7).map((d) => (
          <button
            key={d.iso}
            role="radio"
            aria-checked={value === d.iso}
            aria-label={`${d.label}, ${d.date.getDate()} ${MONTHS[d.date.getMonth()]}${d.closed ? ", closed" : ""}`}
            disabled={d.closed}
            onClick={() => onChange(d.iso)}
            className={`flex min-h-[76px] flex-col items-center justify-center border py-2 transition-colors ${
              value === d.iso
                ? "border-primary bg-primary text-ivory"
                : d.closed
                  ? "cursor-not-allowed border-ink/10 bg-ink/[0.03] text-ink/30"
                  : "border-ink/15 bg-white text-ink hover:border-ink/40"
            }`}
          >
            <span className={`font-accent text-[11px] font-bold tracking-[0.12em] ${value === d.iso ? "text-ivory/80" : d.closed ? "" : "text-primary"}`}>
              {d.closed ? "CLOSED" : d.label}
            </span>
            <span className="font-display text-2xl font-medium leading-tight">{d.date.getDate()}</span>
            <span className={`font-accent text-[11px] ${value === d.iso ? "text-ivory/80" : "text-ink/55"}`}>
              {MONTHS[d.date.getMonth()]}
            </span>
          </button>
        ))}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Choose another date
        </summary>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {list.slice(7).map((d) => (
            <button
              key={d.iso}
              role="radio"
              aria-checked={value === d.iso}
              aria-label={`${d.date.getDate()} ${MONTHS[d.date.getMonth()]}${d.closed ? ", closed" : ""}`}
              disabled={d.closed}
              onClick={() => onChange(d.iso)}
              className={`flex min-h-[64px] flex-col items-center justify-center border py-2 transition-colors ${
                value === d.iso
                  ? "border-primary bg-primary text-ivory"
                  : d.closed
                    ? "cursor-not-allowed border-ink/10 bg-ink/[0.03] text-ink/30"
                    : "border-ink/15 bg-white text-ink hover:border-ink/40"
              }`}
            >
              <span className="font-display text-xl font-medium leading-tight">{d.date.getDate()}</span>
              <span className={`font-accent text-[11px] ${value === d.iso ? "text-ivory/80" : "text-ink/55"}`}>
                {d.closed ? "CLOSED" : MONTHS[d.date.getMonth()]}
              </span>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
