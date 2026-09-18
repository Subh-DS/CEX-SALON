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
  if (txns.length === 0) {
    return (
      <div>
        <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Recent activity</p>
        <p className="mt-2 font-display text-xl text-ink">No activity yet.</p>
        <p className="mt-1 text-[15px] text-ink/60">
          Your Glow Point activity will appear here after your first eligible visit.
        </p>
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
              {items.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="flex items-baseline justify-between gap-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                >
                  <span className="min-w-0 truncate text-[15px] text-ink/80">{t.description}</span>
                  <span
                    aria-label={`${t.points > 0 ? "earned" : "spent"} ${Math.abs(t.points)} Glow Points`}
                    className={`shrink-0 font-accent text-[15px] font-bold ${t.points > 0 ? "text-leafgreen" : "text-marigold-deep"}`}
                  >
                    {t.points > 0 ? `+${t.points}` : `−${Math.abs(t.points)}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
