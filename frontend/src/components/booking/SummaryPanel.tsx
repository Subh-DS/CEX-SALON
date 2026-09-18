import { parseVisitDate } from "../visits/dates";
import { formatINR } from "@/lib/utils";
import type { Service, Staff } from "@/types";

/** Sticky live summary — real selections only, honest empty state. */
export default function SummaryPanel({
  service,
  staff,
  date,
  slot,
}: {
  service: Service | undefined;
  staff: Staff | undefined;
  date: string;
  slot: string | null;
}) {
  const empty = !service && !staff && !slot;
  return (
    <aside className="border border-ink/12 bg-white p-6 lg:sticky lg:top-24" aria-label="Your appointment summary" aria-live="polite">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-primary">Your appointment</p>
      {empty ? (
        <p className="mt-3 text-[15px] text-ink/60">Choose a service to begin.</p>
      ) : (
        <dl className="mt-3 space-y-2.5 text-[15px]">
          {service && (
            <div>
              <dt className="font-accent text-xs text-ink/50">Service</dt>
              <dd className="font-semibold text-ink">
                {service.name} · {service.duration_minutes} min
              </dd>
            </div>
          )}
          {staff && (
            <div>
              <dt className="font-accent text-xs text-ink/50">Expert</dt>
              <dd className="font-semibold text-ink">{staff.name}</dd>
            </div>
          )}
          {date && slot && (
            <div>
              <dt className="font-accent text-xs text-ink/50">When</dt>
              <dd className="font-semibold text-ink">
                {parseVisitDate(`${date}T${slot}:00`).full} · {parseVisitDate(`${date}T${slot}:00`).time}
              </dd>
            </div>
          )}
          {service && (
            <div className="border-t border-ink/10 pt-2.5">
              <dt className="font-accent text-xs text-ink/50">Total</dt>
              <dd className="font-display text-2xl text-ink">{formatINR(service.price)}</dd>
            </div>
          )}
        </dl>
      )}
    </aside>
  );
}
