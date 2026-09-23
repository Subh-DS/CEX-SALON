import { motion } from "framer-motion";
import type { Tier } from "@/api/loyalty";
import type { LoyaltyAccount } from "@/types";
import { useCountUp } from "./anim";

function firstName(email: string | undefined): string | null {
  if (!email) return null;
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
}

/** Editorial hero: eyebrow, animated serif balance, tier line, next-reward proximity. */
export default function LoyaltyHero({
  account,
  tier,
  email,
  nextReward,
}: {
  account: LoyaltyAccount;
  tier: Tier | undefined;
  email: string | undefined;
  nextReward?: { name: string; points_cost: number } | null;
}) {
  const name = firstName(email);
  const shown = useCountUp(account.pointsBalance);
  const short = nextReward ? nextReward.points_cost - account.pointsBalance : 0;

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Glow Points</p>
      <h1 className="mt-2 font-display text-[34px] font-medium tracking-tight text-ink md:text-[40px]">
        {name ? `${name}'s glow` : "Your glow"}
      </h1>
      <p className="mt-1 text-[15px] text-ink/60">A little more back with every visit.</p>

      <p
        aria-live="polite"
        aria-label={`${account.pointsBalance.toLocaleString("en-IN")} Glow Points`}
        className="mt-8 font-display text-[64px] font-medium leading-none tracking-tight text-ink tabular-nums md:text-[76px]"
      >
        {shown.toLocaleString("en-IN")}
      </p>
      <p className="mt-1 font-accent text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
        Glow Points
      </p>

      <p className="mt-4 text-[16px] text-ink/75">
        <b className="font-display text-lg font-medium text-primary">{account.tier} member</b>
        {tier && tier.benefits.length > 0 && (
          <span className="text-ink/60"> · {tier.benefits.slice(0, 2).join(" · ")}</span>
        )}
      </p>

      {nextReward && short > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-3 inline-flex items-center gap-2 rounded-pill bg-marigold-soft px-4 py-2 text-sm font-medium text-marigold-deep"
        >
          <span aria-hidden>✦</span>
          You&apos;re {short.toLocaleString("en-IN")} points away from {nextReward.name}.
        </motion.p>
      )}
    </div>
  );
}
