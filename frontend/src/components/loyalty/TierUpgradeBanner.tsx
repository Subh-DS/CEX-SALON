import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { popIn } from "./anim";

/** Tier-upgrade celebration — rendered only when the tier actually changes. */
export default function TierUpgradeBanner({
  tier,
  benefits,
  onClose,
}: {
  tier: string;
  benefits: string[];
  onClose: () => void;
}) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative mt-8 overflow-hidden rounded-md2 bg-primary p-6 text-ivory shadow-md2 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_85%_10%,rgba(184,111,120,0.45),transparent_60%)]"
      />
      <div className="relative">
        <motion.p
          variants={popIn}
          initial="hidden"
          animate="visible"
          aria-hidden
          className="font-display text-3xl text-marigold-soft"
        >
          ✦
        </motion.p>
        <p className="mt-1 font-accent text-[11px] font-bold uppercase tracking-[0.22em] text-ivory/65">
          Tier upgrade
        </p>
        <p className="mt-1 font-display text-3xl font-medium">You&apos;ve reached {tier}.</p>
        {benefits.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-[15px] text-ivory/85">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-marigold-soft" />
                {b}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-pill bg-white/12 px-6 font-accent text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Keep glowing
        </button>
      </div>
    </motion.div>
  );
}
