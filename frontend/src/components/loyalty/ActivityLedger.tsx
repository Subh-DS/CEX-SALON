import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { LoyaltyTransaction } from "@/api/loyalty";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase();
}

/** Quiet ledger: date-grouped, green in / coral out, text-led values. */
export default function ActivityLedger({ txns }: { txns: LoyaltyTransaction[] }) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const firstSeen = useRef<string | null>(null);

  useEffect(() => {
    const first = txns[0]?.id ?? null;
    if (firstSeen.current === null) {
      // Initial load — no highlight, just record.
      firstSeen.current = first;
      return;
    }
    if (first && first !== firstSeen.current) {
      firstSeen.current = first;
      setHighlightId(first);
      const t = window.setTimeout(() => setHighlightId(null), 2600);
      return () => window.clearTimeout(t);
    }
  }, [txns]);

  if (txns.length === 0) {
    return (
      <div>
        <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Recent activity</p>
        <div className="mt-4 rounded-md2 border border-dashed border-warmborder bg-white/70 px-6 py-10 text-center">
          <p className="font-display text-2xl text-ink">No activity yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink/60">
            Complete your first salon booking to start earning Glow Points.
          </p>
          <Link
            to="/services"
            className="mt-5 inline-flex min-h-[48px] items-center rounded-sm2 bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
          >
            Explore services
          </Link>
        </div>
      </div>
    );
  }

  const groups = new Map<string, LoyaltyTransaction[]>();
  for (const t of txns) {
    const key = new Date(t.created_at).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Recent activity</p>
      <div className="mt-3">
        {Array.from(groups.entries()).map(([day, items]) => (
          <div key={day} className="flex gap-4 border-t border-ink/10 py-4 first:border-t-0 first:pt-0">
            <span className="w-20 shrink-0 pt-0.5 font-accent text-[13px] font-bold uppercase tracking-wide text-ink/50">
              {dayLabel(items[0].created_at)}
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              {items.map((t, i) => {
                const fresh = t.id === highlightId;
                return (
                  <motion.div
                    key={t.id}
                    className={`flex items-baseline justify-between gap-3 rounded-sm2 px-2 py-1 ${fresh ? "bg-marigold-soft/70" : ""}`}
                    initial={fresh ? { opacity: 0, y: -8 } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.03 }}
                  >
                    <span className="min-w-0 truncate text-[15px] text-ink/80">{t.description}</span>
                    <span
                      aria-label={`${t.points > 0 ? "earned" : "spent"} ${Math.abs(t.points)} Glow Points`}
                      className={`shrink-0 font-accent text-[15px] font-bold tabular-nums ${t.points > 0 ? "text-leafgreen" : "text-marigold-deep"}`}
                    >
                      {t.points > 0 ? `+${t.points}` : `−${Math.abs(t.points)}`}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
