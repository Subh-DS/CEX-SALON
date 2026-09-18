import { parseVisitDate } from "../visits/dates";
import { formatINR } from "@/lib/utils";
import type { Service, Staff } from "@/types";

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3.5">
      <div>
        <p className="font-accent text-xs uppercase tracking-[0.12em] text-ink/50">{label}</p>
        <p className="mt-0.5 font-display text-xl font-medium text-ink">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

export default function StepReview({
  service,
  staff,
  date,
  slot,
  onEdit,
}: {
  service: Service | undefined;
  staff: Staff | undefined;
  date: string;
  slot: string | null;
  onEdit: (step: number) => void;
}) {
  const when = date && slot ? parseVisitDate(`${date}T${slot}:00`) : null;
  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Review your appointment</h2>
      <p className="mt-1 text-[15px] text-ink/60">Everything correct? Change anything before paying.</p>
      <div className="mt-4">
        <Row label="Service" value={service ? `${service.name} · ${service.duration_minutes} min` : "—"} onEdit={() => onEdit(0)} />
        <Row label="Expert" value={staff?.name ?? "—"} onEdit={() => onEdit(1)} />
        <Row label="Date" value={when ? when.full : date || "—"} onEdit={() => onEdit(2)} />
        <Row label="Time" value={when ? when.time : "—"} onEdit={() => onEdit(3)} />
      </div>
      <div className="mt-5 border border-ink/12 bg-white p-5">
        <div className="flex justify-between text-[15px]">
          <span className="text-ink/65">{service?.name ?? "Service"}</span>
          <b className="text-ink">{service ? formatINR(service.price) : "—"}</b>
        </div>
        <div className="mt-3 flex justify-between border-t border-ink/10 pt-3">
          <span className="font-accent text-sm font-bold">Total</span>
          <b className="font-display text-2xl text-ink">{service ? formatINR(service.price) : "—"}</b>
        </div>
        <p className="mt-1 text-[13px] text-ink/55">No additional charges — what you see is what you pay.</p>
      </div>
    </div>
  );
}
