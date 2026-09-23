import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { LoyaltyAccount } from "@/types";
import { useCountUp, useReducedMotion } from "./anim";

function memberNo(userId: string | undefined): string {
  const clean = (userId ?? "").replace(/[^0-9a-f]/gi, "").toUpperCase();
  return `BLUSH-${(clean.slice(0, 4) || "GUEST").padEnd(4, "0")}`;
}

/** Premium membership card — restrained shine sweep on hover (motion-safe only). */
export default function LoyaltyCard({
  account,
  userId,
}: {
  account: LoyaltyAccount;
  userId: string | undefined;
}) {
  const reduced = useReducedMotion();
  const shown = useCountUp(account.pointsBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative mt-8 overflow-hidden rounded-md2 bg-primary p-6 text-ivory shadow-md2 sm:p-7"
      aria-label={`${account.tier} membership card with ${account.pointsBalance} Glow Points`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_85%_10%,rgba(184,111,120,0.45),transparent_60%)]"
      />
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-1000 group-hover:left-full group-hover:opacity-100"
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <p className="font-accent text-[11px] font-bold uppercase tracking-[0.28em] text-ivory/70">
          The Blush Studio
        </p>
        <Sparkles className="h-5 w-5 text-marigold-soft" aria-hidden />
      </div>
      <p className="relative mt-4 font-display text-2xl font-medium tracking-wide">
        ✦ {account.tier} Member
      </p>
      <p className="relative mt-1 font-accent text-lg font-bold tabular-nums text-ivory/90">
        {shown.toLocaleString("en-IN")} points
      </p>
      <p className="relative mt-4 font-accent text-xs font-semibold uppercase tracking-[0.2em] text-ivory/60">
        Member {memberNo(userId)}
      </p>
    </motion.div>
  );
}
