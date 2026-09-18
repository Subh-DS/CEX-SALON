import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRedeem, type RedeemResult, type RewardFull } from "@/api/loyalty";
import { formatINR } from "@/lib/utils";

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
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="redeem-title"
        className="w-full max-w-md bg-white p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <>
            <p className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-leafgreen">Redeemed</p>
            <h3 id="redeem-title" className="mt-1 font-display text-2xl font-medium text-ink">
              {success.reward_name} is yours.
            </h3>
            <p className="mt-3 text-[15px] text-ink/70">
              Show this code on your next visit:
            </p>
            <p className="mt-2 border border-dashed border-ink/25 bg-ivory px-4 py-3 text-center font-accent text-xl font-bold tracking-[0.2em] text-primary">
              {success.code}
            </p>
            <p className="mt-3 text-sm text-ink/60">
              {success.points_spent} points deducted · {success.points_balance.toLocaleString("en-IN")} left.
            </p>
            <button
              ref={keepRef}
              onClick={onKeep}
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h3 id="redeem-title" className="font-display text-2xl font-medium text-ink">
              Redeem {reward.name}?
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
              {reward.points_cost.toLocaleString("en-IN")} Glow Points will be deducted from your balance
              ({balance.toLocaleString("en-IN")}).
            </p>
            <p className="mt-2 text-[15px] text-ink/70">
              You'll receive: <b className="text-ink">{reward.description ?? reward.name}</b>
              {reward.value > 0 && <> · worth {formatINR(reward.value)}</>}.
            </p>
            {error && (
              <p role="alert" className="mt-3 bg-[#f7e8e8] px-3 py-2 text-sm text-[#b84444]">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={keepRef}
                onClick={onKeep}
                className="inline-flex min-h-[48px] items-center justify-center border border-ink px-6 font-accent text-sm font-semibold text-ink hover:bg-ink hover:text-ivory"
              >
                Keep points
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="inline-flex min-h-[48px] items-center justify-center bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep disabled:opacity-60"
              >
                {busy ? "Redeeming…" : "Redeem reward"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RewardsSection({
  rewards,
  balance,
}: {
  rewards: RewardFull[];
  balance: number;
}) {
  const redeem = useRedeem();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState<RedeemResult | null>(null);
  const active = rewards.find((r) => r.id === activeId) ?? null;

  async function confirm() {
    if (!active) return;
    try {
      const result = await redeem.mutateAsync(active.id);
      setDone(result);
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
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Rewards</p>
      <h2 className="mt-2 font-display text-[28px] font-medium tracking-tight text-ink">
        Use your points on things you'll actually want.
      </h2>
      {rewards.length === 0 ? (
        <div className="mt-5 border border-ink/12 bg-white p-6">
          <p className="font-display text-xl text-ink">No rewards yet.</p>
          <p className="mt-1 text-[15px] text-ink/60">
            New rewards will appear here when they're available. Keep earning in the meantime.
          </p>
          <Link to="/book" className="mt-3 inline-block font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Book an appointment
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rewards.map((r, i) => {
            const afford = balance >= r.points_cost;
            const short = r.points_cost - balance;
            return (
              <motion.div
                key={r.id}
                className="border border-ink/12 bg-white p-5"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: (i % 2) * 0.05 }}
              >
                <p className="font-display text-xl font-medium text-ink">{r.name}</p>
                <p className="mt-0.5 text-sm text-ink/60">{r.description}</p>
                <p className="mt-3 font-accent text-sm">
                  <b className="text-primary">{r.points_cost.toLocaleString("en-IN")} Glow Points</b>
                </p>
                {!afford ? (
                  <p className="mt-2 text-sm text-ink/60">
                    You have {balance.toLocaleString("en-IN")} · {short.toLocaleString("en-IN")} more needed.{" "}
                    <Link to="/book" className="font-semibold text-primary underline-offset-4 hover:underline">
                      Earn more →
                    </Link>
                  </p>
                ) : (
                  <button
                    onClick={() => { setActiveId(r.id); setDone(null); }}
                    className="mt-3 inline-flex min-h-[44px] items-center border border-ink px-5 font-accent text-sm font-semibold text-ink hover:bg-primary hover:border-primary hover:text-ivory"
                  >
                    Redeem
                  </button>
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
