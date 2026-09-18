import { motion } from "framer-motion";
import type { Tier } from "@/api/loyalty";

/** Tier journey rows — current tier prominent, others quiet. */
export default function TierJourney({
  tiers,
  current,
}: {
  tiers: Tier[];
  current: string;
}) {
  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Your glow journey</p>
      <div className="mt-4 border-t border-ink/12">
        {tiers.map((t, i) => {
          const active = t.name === current;
          return (
            <motion.div
              key={t.name}
              className={`grid grid-cols-12 items-baseline gap-3 border-b border-ink/12 py-4 ${active ? "" : "opacity-60"}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: active ? 1 : 0.6 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.04 }}
            >
              <span className={`col-span-5 font-display text-xl font-medium sm:col-span-4 ${active ? "text-primary" : "text-ink"}`}>
                {t.name}
                {active && <span className="ml-2 font-accent text-xs font-bold uppercase tracking-wider">· you</span>}
              </span>
              <span className="col-span-3 font-accent text-sm font-semibold text-ink/60 sm:col-span-2">
                {t.min_points === 0 ? "start" : t.min_points.toLocaleString("en-IN")}
              </span>
              <span className="col-span-4 text-sm text-ink/60 sm:col-span-6">{t.benefits.join(" · ")}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
