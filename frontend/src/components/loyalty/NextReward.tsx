import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RewardFull } from "@/api/loyalty";
import { fadeUp } from "./anim";

function scrollToRewards() {
  document.getElementById("rewards")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Spotlight on the nearest goal — real rewards data, animated progress, gentle glow when close. */
export default function NextReward({
  rewards,
  balance,
}: {
  rewards: RewardFull[];
  balance: number;
}) {
  if (rewards.length === 0) return null;

  const sorted = [...rewards].sort((a, b) => a.points_cost - b.points_cost);
  const goal = sorted.find((r) => r.points_cost > balance) ?? null;

  if (!goal) {
    const best = sorted[sorted.length - 1];
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mt-8 rounded-md2 border border-warmborder bg-white p-6 shadow-sm2"
      >
        <p className="font-accent text-[11px] font-bold uppercase tracking-[0.18em] text-leafgreen">Next reward</p>
        <p className="mt-2 font-display text-2xl font-medium text-ink">
          Everything&apos;s within reach — even {best.name}.
        </p>
        <button
          onClick={scrollToRewards}
          className="mt-4 inline-flex min-h-[48px] items-center rounded-sm2 bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
        >
          View rewards
        </button>
      </motion.div>
    );
  }

  const pct = Math.min(100, Math.round((balance / goal.points_cost) * 100));
  const short = goal.points_cost - balance;
  const close = pct >= 70;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={cn(
        "mt-8 rounded-md2 border bg-white p-6 shadow-sm2 transition-shadow",
        close ? "border-marigold/50 shadow-md2" : "border-warmborder"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-accent text-[11px] font-bold uppercase tracking-[0.18em] text-marigold-deep">
            Next reward
          </p>
          <p className="mt-2 font-display text-[28px] font-medium leading-tight text-ink">{goal.name}</p>
          {goal.description && <p className="mt-1 text-[15px] text-ink/60">{goal.description}</p>}
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-marigold-soft text-marigold-deep">
          <Gift className="h-6 w-6" strokeWidth={1.7} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between font-accent text-sm">
        <span className="font-bold text-ink">
          {balance.toLocaleString("en-IN")}{" "}
          <span className="font-medium text-ink/50">/ {goal.points_cost.toLocaleString("en-IN")}</span>
        </span>
        <span className="font-semibold text-marigold-deep">{short.toLocaleString("en-IN")} points to go</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={balance}
        aria-valuemin={0}
        aria-valuemax={goal.points_cost}
        aria-label={`${pct}% toward ${goal.name}`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <button
        onClick={scrollToRewards}
        className="mt-4 inline-flex min-h-[48px] items-center rounded-sm2 border border-ink px-6 font-accent text-sm font-semibold text-ink transition-colors hover:bg-primary hover:border-primary hover:text-ivory"
      >
        View reward
      </button>
    </motion.div>
  );
}
