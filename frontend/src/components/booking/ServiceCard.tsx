import SmartImage from "../decor/SmartImage";
import { serviceImage } from "@/data/images";
import { formatINR } from "@/lib/utils";
import type { Service } from "@/types";

/** Image-rich service card: whole card clickable, radio semantics, plum selection. */
export default function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group overflow-hidden border bg-white text-left transition-colors ${
        selected ? "border-primary shadow-md2" : "border-ink/12 hover:border-ink/30"
      }`}
    >
      <div className={selected ? "bg-[#f6e9e4]" : ""}>
        <SmartImage src={serviceImage(service)} alt={`${service.name} — ${service.duration_minutes} minutes`} className="aspect-[16/10] w-full" />
        <div className="flex items-start justify-between gap-3 p-4">
          <span>
            <b className="font-display text-lg font-medium leading-snug text-ink">{service.name}</b>
            <span className="mt-0.5 block font-accent text-[13px] font-semibold text-ink/55">
              {service.duration_minutes} min · {formatINR(service.price)}
            </span>
            <span className="mt-1 block text-sm leading-snug text-ink/65">{service.description}</span>
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
      </div>
    </button>
  );
}
