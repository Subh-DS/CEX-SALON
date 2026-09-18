const LABELS: Record<string, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

const TONES: Record<string, string> = {
  pending: "bg-marigold-soft text-marigold-deep",
  confirmed: "bg-[#e3efe8] text-leafgreen",
  in_progress: "bg-[#ece5ef] text-primary",
  completed: "bg-ink/5 text-ink/70",
  cancelled: "bg-[#f7e8e8] text-[#b84444]",
  no_show: "bg-ink/5 text-ink/60",
};

export function statusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export default function VisitStatus({ status }: { status: string }) {
  return (
    <span
      role="status"
      aria-label={`Status: ${statusLabel(status)}`}
      className={`inline-flex min-h-[28px] items-center rounded-full px-3 font-accent text-[13px] font-semibold ${TONES[status] ?? TONES.completed}`}
    >
      {statusLabel(status)}
    </span>
  );
}
