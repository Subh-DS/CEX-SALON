import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  formatINR,
  isValidCvv,
  isValidExpiry,
  luhnOk,
} from "./utils";

function CardPreview({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  const digits = number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const last4 = digits.slice(-4).padStart(4, "•");
  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-lg2 bg-primary p-5 text-ivory shadow-md2"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_85%_10%,rgba(184,111,120,0.5),transparent_60%)]" />
      <div className="relative flex items-center justify-between">
        <p className="font-accent text-[11px] font-bold uppercase tracking-[0.28em] text-ivory/70">
          The Blush Studio
        </p>
        <p className="rounded-sm2 bg-white/12 px-2.5 py-1 font-accent text-xs font-bold tracking-wide">
          {brand.toUpperCase()}
        </p>
      </div>
      <p className="relative mt-5 font-mono text-lg tracking-[0.14em] sm:text-xl">
        {digits ? `•••• •••• •••• ${last4}` : "•••• •••• •••• ••••"}
      </p>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <p className="min-w-0 truncate font-accent text-sm font-semibold uppercase tracking-wider text-ivory/90">
          {name.trim() || "YOUR NAME"}
        </p>
        <p className="shrink-0 font-mono text-sm text-ivory/90">{expiry || "MM / YY"}</p>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1.5 min-h-[48px] w-full rounded-sm2 border border-warmborder bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40";

export default function CardPayment({
  amount,
  onPay,
}: {
  amount: number;
  onPay: (last4: string) => void;
}) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [tried, setTried] = useState(false);

  const errors = {
    number: !number.trim()
      ? tried ? "Card number is required." : null
      : !luhnOk(number) ? "Please enter a valid card number." : null,
    name: !name.trim() && tried ? "Please enter the name on the card." : null,
    expiry: !expiry.trim()
      ? tried ? "Expiry date is required." : null
      : !isValidExpiry(expiry) ? "Expiry date is invalid or in the past — use MM / YY." : null,
    cvv: !cvv.trim()
      ? tried ? "CVV is required." : null
      : !isValidCvv(cvv) ? "CVV must be 3–4 digits." : null,
  };
  const valid = !errors.number && !errors.name && !errors.expiry && !errors.cvv;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    onPay(number.replace(/\D/g, "").slice(-4));
  }

  return (
    <div>
      <CardPreview number={number} name={name} expiry={expiry} />
      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="card-number" className="font-accent text-[13px] font-semibold text-ink">
            Card number
          </label>
          <input
            id="card-number"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            autoComplete="cc-number"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? "card-number-error" : undefined}
            className={cn(inputCls, errors.number && "border-[#b84444]")}
          />
          {errors.number && (
            <p id="card-number-error" role="alert" className="mt-1.5 text-[13px] text-[#b84444]">
              {errors.number}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="card-name" className="font-accent text-[13px] font-semibold text-ink">
            Name on card
          </label>
          <input
            id="card-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name as on card"
            autoComplete="cc-name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "card-name-error" : undefined}
            className={cn(inputCls, errors.name && "border-[#b84444]")}
          />
          {errors.name && (
            <p id="card-name-error" role="alert" className="mt-1.5 text-[13px] text-[#b84444]">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="card-expiry" className="font-accent text-[13px] font-semibold text-ink">
              Expiry
            </label>
            <input
              id="card-expiry"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              inputMode="numeric"
              autoComplete="cc-exp"
              aria-invalid={!!errors.expiry}
              aria-describedby={errors.expiry ? "card-expiry-error" : undefined}
              className={cn(inputCls, errors.expiry && "border-[#b84444]")}
            />
            {errors.expiry && (
              <p id="card-expiry-error" role="alert" className="mt-1.5 text-[13px] text-[#b84444]">
                {errors.expiry}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="card-cvv" className="font-accent text-[13px] font-semibold text-ink">
              CVV
            </label>
            <div className="relative">
              <input
                id="card-cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                inputMode="numeric"
                autoComplete="cc-csc"
                type={showCvv ? "text" : "password"}
                aria-invalid={!!errors.cvv}
                aria-describedby={errors.cvv ? "card-cvv-error" : undefined}
                className={cn(inputCls, "pr-11", errors.cvv && "border-[#b84444]")}
              />
              <button
                type="button"
                onClick={() => setShowCvv((v) => !v)}
                aria-label={showCvv ? "Hide CVV" : "Show CVV"}
                aria-pressed={showCvv}
                className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm2 text-ink/50 hover:text-ink"
              >
                {showCvv ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {errors.cvv && (
              <p id="card-cvv-error" role="alert" className="mt-1.5 text-[13px] text-[#b84444]">
                {errors.cvv}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-sm2 bg-primary px-8 font-accent text-[15px] font-semibold text-ivory transition-colors hover:bg-plum-deep max-lg:sticky max-lg:bottom-4"
        >
          Pay {formatINR(amount)}
        </button>
        <p className="text-[13px] leading-relaxed text-ink/50">
          Demo checkout — card details never leave this page and no real money moves.
        </p>
      </form>
    </div>
  );
}
