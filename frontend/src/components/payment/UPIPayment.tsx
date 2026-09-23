import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, LoaderCircle, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR, isValidUpiId, upiDisplayName } from "./utils";

const UPI_APPS = [
  { id: "gpay", label: "Google Pay", mark: "G", tint: "bg-[#e8effc] text-[#1a56db]" },
  { id: "phonepe", label: "PhonePe", mark: "Pe", tint: "bg-[#e9e4f6] text-[#5f259f]" },
  { id: "paytm", label: "Paytm", mark: "P", tint: "bg-[#e3f2f9] text-[#002e6e]" },
  { id: "bhim", label: "BHIM", mark: "B", tint: "bg-[#e5f3e7] text-[#1c6b2f]" },
];

/** Deterministic demo QR pattern (decorative — no real payment data). */
function DemoQr() {
  const cells: boolean[] = [];
  let seed = 898;
  for (let i = 0; i < 225; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c > 7) || (r > 7 && c < 7);
  return (
    <div
      role="img"
      aria-label="Demo QR code — scan simulation only"
      className="grid w-44 grid-cols-[repeat(15,1fr)] gap-px rounded-lg border border-warmborder bg-white p-3"
    >
      {cells.map((on, i) => {
        const r = Math.floor(i / 15);
        const c = i % 15;
        if (finder(r, c)) {
          const lr = r < 7 ? r : r - 8;
          const lc = c < 7 ? c : c - 8;
          const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          return <span key={i} className={cn("aspect-square", ring || core ? "bg-ink" : "bg-white")} />;
        }
        return <span key={i} className={cn("aspect-square", on ? "bg-ink" : "bg-white")} />;
      })}
    </div>
  );
}

export default function UPIPayment({
  amount,
  onPay,
}: {
  amount: number;
  /** label describes the chosen rail, e.g. "UPI · ananya@oksbi" or "UPI · Google Pay". */
  onPay: (label: string) => void;
}) {
  const [tab, setTab] = useState<"id" | "qr">("id");
  const [upiId, setUpiId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleIdChange(v: string) {
    setUpiId(v);
    setVerified(false);
    if (error) setError(null);
  }

  function verify() {
    const v = upiId.trim();
    if (!v) {
      setError("Please enter your UPI ID.");
      return;
    }
    if (!isValidUpiId(v)) {
      setError("That UPI ID doesn't look right — it should look like name@bank.");
      return;
    }
    setError(null);
    setVerifying(true);
    window.setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 900);
  }

  return (
    <div>
      <div className="inline-flex rounded-pill border border-warmborder bg-surfacewarm/60 p-1" role="tablist" aria-label="UPI options">
        {(["id", "qr"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex min-h-[40px] items-center gap-1.5 rounded-pill px-4 font-accent text-sm font-semibold transition-colors",
              tab === t ? "bg-white text-ink shadow-sm2" : "text-ink/55 hover:text-ink"
            )}
          >
            {t === "qr" && <QrCode className="h-4 w-4" />}
            {t === "id" ? "UPI ID" : "Scan & Pay"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "id" ? (
          <motion.div
            key="id"
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-4"
          >
            <label htmlFor="upi-id" className="font-accent text-[13px] font-semibold text-ink">
              UPI ID
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="upi-id"
                value={upiId}
                onChange={(e) => handleIdChange(e.target.value)}
                placeholder="yourname@oksbi"
                autoComplete="off"
                inputMode="email"
                aria-invalid={!!error}
                aria-describedby={error ? "upi-id-error" : verified ? "upi-verified" : undefined}
                className="min-h-[48px] w-full min-w-0 flex-1 rounded-sm2 border border-warmborder bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40"
              />
              <button
                onClick={verify}
                disabled={verifying || !upiId.trim()}
                className="inline-flex min-h-[48px] shrink-0 items-center rounded-sm2 border border-primary px-4 font-accent text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
              >
                {verifying ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Verify"}
              </button>
            </div>
            {error && (
              <p id="upi-id-error" role="alert" className="mt-1.5 text-[13px] text-[#b84444]">
                {error}
              </p>
            )}
            {verified && !error && (
              <p id="upi-verified" className="mt-2 flex items-center gap-1.5 rounded-sm2 bg-[#e3efe8] px-3 py-2.5 text-sm font-medium text-leafgreen">
                <BadgeCheck className="h-4 w-4" />
                UPI ID verified · {upiDisplayName(upiId)}
              </p>
            )}
            <button
              onClick={() => onPay(`UPI · ${upiId.trim()}`)}
              disabled={!verified}
              className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-sm2 bg-primary px-8 font-accent text-[15px] font-semibold text-ivory transition-colors hover:bg-plum-deep disabled:opacity-40 max-lg:sticky max-lg:bottom-4"
            >
              Pay {formatINR(amount)}
            </button>
            {!verified && (
              <p className="mt-2 text-[13px] text-ink/50">Verify your UPI ID to enable payment.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="qr"
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-4 flex flex-col items-center rounded-md2 border border-dashed border-warmborder bg-ivory/60 px-6 py-6 text-center"
          >
            <DemoQr />
            <p className="mt-3 text-sm text-ink/60">Scan using any UPI app</p>
            <p className="mt-1 font-accent text-[13px] font-semibold uppercase tracking-wide text-ink/50">Amount</p>
            <p className="font-display text-3xl text-ink">{formatINR(amount)}</p>
            <button
              onClick={() => onPay("UPI · Scan & Pay")}
              className="mt-4 inline-flex min-h-[48px] items-center rounded-pill bg-ink px-7 font-accent text-sm font-semibold text-ivory hover:opacity-90"
            >
              I&apos;ve completed the payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <p className="font-accent text-[13px] font-bold uppercase tracking-[0.12em] text-ink/50">
          Or pay using a UPI app
        </p>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {UPI_APPS.map((a) => (
            <button
              key={a.id}
              onClick={() => onPay(`UPI · ${a.label}`)}
              aria-label={`Pay with ${a.label}`}
              className="flex flex-col items-center gap-1.5 rounded-md2 border border-warmborder bg-white px-2 py-3 transition-all hover:-translate-y-0.5 hover:border-primary-light hover:shadow-sm2"
            >
              <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full font-accent text-sm font-bold", a.tint)}>
                {a.mark}
              </span>
              <span className="text-xs font-medium text-ink/70">{a.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-ink/45">You&apos;ll get a collect request in the app to approve.</p>
      </div>
    </div>
  );
}
