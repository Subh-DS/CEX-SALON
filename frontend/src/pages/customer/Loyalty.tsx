import { useCallback, useState } from "react";
import LoyaltyHero from "@/components/loyalty/LoyaltyHero";
import LoyaltyCard from "@/components/loyalty/LoyaltyCard";
import TierProgress from "@/components/loyalty/TierProgress";
import TierJourney from "@/components/loyalty/TierJourney";
import NextReward from "@/components/loyalty/NextReward";
import RewardsSection from "@/components/loyalty/RewardsSection";
import EarnPoints from "@/components/loyalty/EarnPoints";
import ActivityLedger from "@/components/loyalty/ActivityLedger";
import HowItWorks from "@/components/loyalty/HowItWorks";
import NextAction from "@/components/loyalty/NextAction";
import GlowSkeleton from "@/components/loyalty/GlowSkeleton";
import TierUpgradeBanner from "@/components/loyalty/TierUpgradeBanner";
import { ToastStack, type ToastMsg } from "@/components/loyalty/Toast";
import { usePrevious } from "@/components/loyalty/anim";
import { useAuth } from "@/context/AuthContext";
import {
  useLoyaltyAccount,
  useLoyaltyTransactions,
  useRewards,
  useTiers,
} from "@/api/loyalty";

let toastId = 0;

export default function Loyalty() {
  const { user } = useAuth();
  const accountQ = useLoyaltyAccount();
  const tiersQ = useTiers();
  const rewardsQ = useRewards();
  const txQ = useLoyaltyTransactions();

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [upgradeSeen, setUpgradeSeen] = useState<string | null>(null);

  const pushToast = useCallback((text: string, tone: "success" | "warn") => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
  }, []);
  const dropToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loading = accountQ.isPending || tiersQ.isPending;
  const failed = accountQ.isError || tiersQ.isError;
  const account = accountQ.data;
  const tiers = tiersQ.data;

  // Celebrate only when the tier actually changes while watching.
  const prevTier = usePrevious(account?.tier);
  const tierChanged = !!account && !!prevTier && prevTier !== account.tier && upgradeSeen !== account.tier;
  const currentTier = tiers?.find((t) => t.name === account?.tier);
  const nextReward = (rewardsQ.data ?? [])
    .filter((r) => account && r.points_cost > account.pointsBalance)
    .sort((a, b) => a.points_cost - b.points_cost)[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      <ToastStack toasts={toasts} onDone={dropToast} />

      {loading && <GlowSkeleton />}

      {failed && (
        <div className="py-10 text-center">
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Glow Points</p>
          <p className="mt-3 font-display text-2xl text-ink">We couldn&apos;t load your Glow Points.</p>
          <button
            onClick={() => { accountQ.refetch(); tiersQ.refetch(); }}
            className="mt-4 inline-flex min-h-[48px] items-center rounded-sm2 bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
          >
            Try again
          </button>
        </div>
      )}

      {account && tiers && (
        <>
          <LoyaltyHero
            account={account}
            tier={currentTier}
            email={user?.email}
            nextReward={nextReward}
          />

          {tierChanged && (
            <TierUpgradeBanner
              tier={account.tier}
              benefits={currentTier?.benefits ?? []}
              onClose={() => setUpgradeSeen(account.tier)}
            />
          )}

          <LoyaltyCard account={account} userId={user?.id} />

          <TierProgress account={account} tiers={tiers} />

          {rewardsQ.data && (
            <NextReward rewards={rewardsQ.data} balance={account.pointsBalance} />
          )}

          <div className="mt-10">
            <NextAction account={account} tiers={tiers} rewards={rewardsQ.data ?? []} />
          </div>

          <div className="mt-12">
            {rewardsQ.isPending && <GlowSkeleton />}
            {rewardsQ.isError && (
              <div className="rounded-md2 border border-warmborder bg-white p-6 shadow-sm2">
                <p className="text-[15px] text-ink/70">Rewards aren&apos;t available right now.</p>
                <button onClick={() => rewardsQ.refetch()} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
                  Try again
                </button>
              </div>
            )}
            {rewardsQ.data && (
              <RewardsSection rewards={rewardsQ.data} balance={account.pointsBalance} onToast={pushToast} />
            )}
          </div>

          <div className="mt-12">
            <EarnPoints onNotify={(text) => pushToast(text, "success")} />
          </div>

          <div className="mt-12">
            <TierJourney tiers={tiers} current={account.tier} />
          </div>

          <div className="mt-12">
            {txQ.isPending && <GlowSkeleton />}
            {txQ.isError && (
              <p className="text-[15px] text-ink/60">
                Activity isn&apos;t available right now — your points above are still current.
              </p>
            )}
            {txQ.data && <ActivityLedger txns={txQ.data} />}
          </div>

          <div className="mt-12 border-t border-ink/12 pt-10">
            <HowItWorks />
          </div>
        </>
      )}
    </div>
  );
}
