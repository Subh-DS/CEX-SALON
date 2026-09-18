import SmartImage from "../decor/SmartImage";
import { staffImage } from "@/data/images";
import type { Staff } from "@/types";

/** Expert card: photograph first, quiet facts, plum selection. */
export default function ExpertCard({
  staff,
  selected,
  onSelect,
}: {
  staff: Staff;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`overflow-hidden border bg-white text-left transition-colors ${
        selected ? "border-primary shadow-md2" : "border-ink/12 hover:border-ink/30"
      }`}
    >
      <SmartImage src={staffImage(staff)} alt={`Portrait of ${staff.name}`} className="aspect-[4/3] w-full" />
      <div className="flex items-start justify-between gap-3 p-4">
        <span>
          <b className="font-accent text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {staff.specialties.slice(0, 2).join(" · ")}
          </b>
          <b className="mt-0.5 block font-display text-xl font-medium text-ink">{staff.name}</b>
          <span className="mt-0.5 block text-sm text-ink/60">
            ★ {staff.rating} · {staff.experience_years} years
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold ${
            selected ? "border-primary bg-primary text-ivory" : "border-ink/25 text-transparent"
          }`}
        >
          ✓
        </span>
      </div>
    </button>
  );
}
