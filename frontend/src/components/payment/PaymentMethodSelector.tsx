import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "./utils";

const METHODS: { id: PaymentMethod; title: string; sub: string; icon: typeof Smartphone }[] = [
  { id: "upi", title: "UPI", sub: "GPay, PhonePe & more", icon: Smartphone },
  { id: "card", title: "Card", sub: "Credit / Debit", icon: CreditCard },
  { id: "cash", title: "Cash", sub: "Pay at the salon", icon: Banknote },
];

export default function PaymentMethodSelector({
  selected,
  onSelect,
}: {
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {METHODS.map((m) => {
        const active = selected === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(m.id)}
            className={cn(
              "relative flex min-h-[104px] flex-col items-start gap-1 rounded-md2 border p-3.5 text-left transition-all sm:p-4",
              active
                ? "border-primary bg-white shadow-md2 ring-2 ring-primary-light/50"
                : "border-warmborder bg-white/70 hover:border-primary-light hover:bg-white"
            )}
          >
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                active ? "bg-primary text-ivory" : "bg-surfacewarm text-ink/60"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <span className="mt-1 font-accent text-[15px] font-bold text-ink">{m.title}</span>
            <span className="text-xs leading-snug text-ink/55">{m.sub}</span>
            <span
              aria-hidden
              className={cn(
                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                active ? "border-primary bg-primary text-[11px] font-bold text-white" : "border-ink/20 text-transparent"
              )}
            >
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}
