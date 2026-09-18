import { Link } from "react-router-dom";
import type { RewardFull, Tier } from "@/api/loyalty";
import type { LoyaltyAccount } from "@/types";

/** One contextual next step — never a wall of CTAs. */
export default function NextAction({
  account,
  tiers,
  rewards,
}: {
  account: LoyaltyAccount;
  tiers: Tier[];
  rewards: RewardFull[];
}) {
  const idx = tiers.findIndex((t) => t.name === account.tier);
  const next = idx >= 0 && idx < tiers.length - 1 ? tiers[idx + 1] : null;
  const affordable = rewards.some((r) => account.pointsBalance >= r.points_cost);

  let line: string;
  let cta: string;
  let to: string;
  if (account.pointsBalance === 0 && account.totalEarned === 0) {
    line = "Start earning with your first visit.";
    cta = "Book an appointment";
    to = "/book";
  } else if (affordable) {
    const best = rewards.filter((r) => account.pointsBalance >= r.points_cost).sort((a, b) => b.points_cost - a.points_cost)[0];
    line = `You have enough for ${best.name}.`;
    cta = "View rewards";
    to = "/loyalty";
  } else if (next) {
    const toGo = next.min_points - account.tierPoints;
    line = `You're ${toGo.toLocaleString("en-IN")} points from ${next.name}. One more visit could get you closer.`;
    cta = "Book your next visit";
    to = "/book";
  } else {
    line = "Keep your glow going.";
    cta = "Book your next visit";
    to = "/book";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-ink/12 py-5">
      <p className="font-display text-xl font-medium text-ink">{line}</p>
      <Link
        to={to}
        className="inline-flex min-h-[48px] items-center bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
      >
        {cta}
      </Link>
    </div>
  );
}
