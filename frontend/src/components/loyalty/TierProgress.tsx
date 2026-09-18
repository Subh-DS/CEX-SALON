import { motion } from "framer-motion";
import type { Tier } from "@/api/loyalty";
import type { LoyaltyAccount } from "@/types";

/** Refined progress: thin track, plum fill, meaningful endpoints, honest a11y label. */
export default function TierProgress({
  account,
  tiers,
}: {
  account: LoyaltyAccount;
  tiers: Tier[];
}) {
  const idx = tiers.findIndex((t) => t.name === account.tier);
  const next = idx >= 0 && idx < tiers.length - 1 ? tiers[idx + 1] : null;

  if (!next) {
    return (
      <div className="mt-8 border-t border-ink/12 pt-6">
        <p className="font-display text-xl font-medium text-ink">Radiance — our highest Glow tier.</p>
        <p className="mt-1 text-[15px] text-ink/60">Every visit keeps it glowing.</p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((account.tierPoints / next.min_points) * 100));
  const toGo = next.min_points - account.tierPoints;

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between font-accent text-sm">
        <span className="font-bold text-ink">
          {account.tierPoints.toLocaleString("en-IN")}{" "}
          <span className="font-medium text-ink/50">/ {next.min_points.toLocaleString("en-IN")}</span>
        </span>
        <span className="font-semibold text-primary">{toGo.toLocaleString("en-IN")} to {next.name}</span>
      </div>
      <div
        className="mt-2 h-[6px] overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={account.tierPoints}
        aria-valuemin={0}
        aria-valuemax={next.min_points}
        aria-label={`${account.tierPoints.toLocaleString("en-IN")} of ${next.min_points.toLocaleString("en-IN")} points toward ${next.name}`}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex justify-between font-accent text-xs text-ink/50">
        <span>{account.tier}</span>
        <span>{next.name}</span>
      </div>
    </div>
  );
}
