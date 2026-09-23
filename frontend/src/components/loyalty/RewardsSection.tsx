import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, LoaderCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRedeem, type RedeemResult, type RewardFull } from "@/api/loyalty";
import { formatINR } from "@/lib/utils";
import { fadeUp, popIn, useReducedMotion } from "./anim";

/** A few celebratory dots — motion-safe only, never full-screen confetti. */
function UnlockParticles() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  const dots = [
    { x: -48, y: -32 }, { x: 44, y: -40 }, { x: -32, y: 36 }, { x: 38, y: 32 }, { x: 0, y: -50 }, { x: -54, y: 8 },
  ];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-marigold"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: d.x, y: d.y, scale: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      ))}
    </span>
  );
}

function RedeemDialog({
  reward,
  balance,
  busy,
  error,
  success,
  onKeep,
  onConfirm,
}: {
  reward: RewardFull;
  balance: number;
  busy: boolean;
  error: string | null;
  success: RedeemResult | null;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const keepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    keepRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKeep();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKeep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onKeep} role="presentation">
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="redeem-title"
        className="relative w-full max-w-md rounded-md2 bg-white p-7 shadow-lg2"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {success ? (
          <div className="relative text-center">
            <UnlockParticles />
            <motion.span
              variants={popIn}
              initial="hidden"
              animate="visible"
              aria-hidden
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e3efe8] text-2xl font-bold text-leafgreen"
            >
              ✓
            </motion.span>
            <p className="mt-3 font-accent text-xs font-bold uppercase tracking-[0.18em] text-leafgreen">Reward unlocked</p>
            <h3 id="redeem-title" className="mt-1 font-display text-2xl font-medium text-ink">
              {success.reward_name} is yours.
            </h3>
            <p className="mt-3 text-[15px] text-ink/70">Show this code on your next visit:</p>
            <p className="mt-2 border border-dashed border-ink/25 bg-ivory px-4 py-3 text-center font-accent text-xl font-bold tracking-[0.2em] text-primary">
              {success.code}
            </p>
            <p className="mt-3 text-sm text-ink/60">
              {success.points_spent} points deducted · {success.points_balance.toLocaleString("en-IN")} left.
            </p>
            <button
              ref={keepRef}
              onClick={onKeep}
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-sm2 bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 id="redeem-title" className="font-display text-2xl font-medium text-ink">
              Redeem {reward.name}?
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
              {reward.points_cost.toLocaleString("en-IN")} Glow Points will be deducted from your balance
              ({balance.toLocaleString("en-IN")}).
            </p>
            <p className="mt-2 border-t border-warmborder pt-3 text-[15px] text-ink/70">
              After redemption:{" "}
              <b className="text-ink tabular-nums">
                {(balance - reward.points_cost).toLocaleString("en-IN")} points
              </b>
            </p>
            <p className="mt-2 text-[15px] text-ink/70">
              You&apos;ll receive: <b className="text-ink">{reward.description ?? reward.name}</b>
              {reward.value > 0 && <> · worth {formatINR(reward.value)}</>}.
            </p>
            {error && (
              <p role="alert" className="mt-3 rounded-sm2 bg-[#f7e8e8] px-3 py-2 text-sm text-[#b84444]">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={keepRef}
                onClick={onKeep}
                className="inline-flex min-h-[48px] items-center justify-center rounded-sm2 border border-ink px-6 font-accent text-sm font-semibold text-ink hover:bg-ink hover:text-ivory"
              >
                Keep points
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm2 bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep disabled:opacity-60"
              >
                {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {busy ? "Redeeming…" : "Redeem reward"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function RewardsSection({
  rewards,
  balance,
  onToast,
}: {
  rewards: RewardFull[];
  balance: number;
  onToast?: (text: string, tone: "success" | "warn") => void;
}) {
  const redeem = useRedeem();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState<RedeemResult | null>(null);
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set());
  const active = rewards.find((r) => r.id === activeId) ?? null;

  async function confirm() {
    if (!active) return;
    try {
      const result = await redeem.mutateAsync(active.id);
      setDone(result);
      setRedeemedIds((prev) => new Set(prev).add(active.id));
      onToast?.(`✓ ${result.reward_name} redeemed`, "success");
    } catch {
      /* error rendered in dialog */
    }
  }

  function close() {
    setActiveId(null);
    setDone(null);
    redeem.reset();
  }

  return (
    <div id="rewards" className="scroll-mt-24">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Rewards</p>
      <h2 className="mt-2 font-display text-[28px] font-medium tracking-tight text-ink">
        Use your points on things you&apos;ll actually want.
      </h2>
      {rewards.length === 0 ? (
        <div className="mt-5 rounded-md2 border border-warmborder bg-white p-6 shadow-sm2">
          <p className="font-display text-xl text-ink">No rewards yet.</p>
          <p className="mt-1 text-[15px] text-ink/60">
            New rewards will appear here when they&apos;re available. Keep earning in the meantime.
          </p>
          <Link to="/book" className="mt-3 inline-block font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Book an appointment
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rewards.map((r, i) => {
            const pct = Math.min(100, Math.round((balance / r.points_cost) * 100));
            const short = r.points_cost - balance;
            const redeemed = redeemedIds.has(r.id);
            const afford = balance >= r.points_cost && !redeemed;
            const near = !redeemed && !afford && pct >= 50;

            return (
              <motion.div
                key={r.id}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
                className={cn(
                  "rounded-md2 border bg-white p-5 shadow-sm2 transition-all hover:-translate-y-[3px] hover:shadow-md2 active:translate-y-0",
                  redeemed ? "border-leafgreen/40" : afford ? "border-warmborder" : "border-warmborder/70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-medium text-ink">{r.name}</p>
                    {r.description && <p className="mt-0.5 text-sm text-ink/60">{r.description}</p>}
                  </div>
                  {redeemed ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-[#e3efe8] px-3 py-1.5 font-accent text-xs font-bold text-leafgreen">
                      <Check className="h-3.5 w-3.5" /> Redeemed
                    </span>
                  ) : !afford ? (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-ink/40" aria-label="Locked reward">
                      <Lock className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 font-accent text-sm">
                  <b className="text-primary tabular-nums">{r.points_cost.toLocaleString("en-IN")} Glow Points</b>
                </p>

                {!redeemed && (
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"
                    role="progressbar"
                    aria-valuenow={Math.min(balance, r.points_cost)}
                    aria-valuemin={0}
                    aria-valuemax={r.points_cost}
                    aria-label={`${pct}% toward ${r.name}`}
                  >
                    <motion.div
                      className={cn("h-full rounded-full", afford ? "bg-leafgreen" : "bg-primary")}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                )}

                {redeemed ? (
                  <p className="mt-3 text-sm text-ink/60">Show its code on your next visit to enjoy it.</p>
                ) : afford ? (
                  <button
                    onClick={() => { setActiveId(r.id); setDone(null); }}
                    className="mt-3 inline-flex min-h-[44px] items-center rounded-sm2 border border-ink px-5 font-accent text-sm font-semibold text-ink transition-colors hover:border-primary hover:bg-primary hover:text-ivory"
                  >
                    Redeem
                  </button>
                ) : near ? (
                  <button
                    onClick={() => onToast?.(`⚠ You need ${short.toLocaleString("en-IN")} more points for ${r.name}`, "warn")}
                    className="mt-3 inline-flex min-h-[44px] items-center rounded-pill bg-marigold-soft px-5 font-accent text-sm font-semibold text-marigold-deep transition-colors hover:bg-marigold hover:text-white"
                  >
                    {short.toLocaleString("en-IN")} points away
                  </button>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">
                    {short.toLocaleString("en-IN")} more needed ·{" "}
                    <Link to="/book" className="font-semibold text-primary underline-offset-4 hover:underline">
                      Earn more →
                    </Link>
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {active && (
        <RedeemDialog
          reward={active}
          balance={balance}
          busy={redeem.isPending}
          error={redeem.error ? ((redeem.error as { message?: string }).message ?? "Couldn't redeem. Please try again.") : null}
          success={done}
          onKeep={close}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
