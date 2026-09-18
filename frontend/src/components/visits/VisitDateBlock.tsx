import { parseVisitDate } from "./dates";

/** Editorial date block — plum, quiet, never a calendar widget. */
export default function VisitDateBlock({ iso, large = false }: { iso: string; large?: boolean }) {
  const d = parseVisitDate(iso);
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center bg-plum text-ivory ${large ? "w-24 py-5" : "w-[72px] py-3.5"}`}
      aria-label={`${d.full}, ${d.time}`}
    >
      <span className={`font-accent font-bold tracking-[0.18em] text-rose ${large ? "text-[13px]" : "text-[11px]"}`}>
        {d.month}
      </span>
      <span className={`font-display font-medium leading-none ${large ? "text-5xl" : "text-4xl"}`}>
        {d.day}
      </span>
      <span className={`mt-1 font-accent text-ivory/75 ${large ? "text-[13px]" : "text-xs"}`}>{d.time}</span>
    </div>
  );
}
