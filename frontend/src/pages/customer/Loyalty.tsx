import LoyaltyHero from "@/components/loyalty/LoyaltyHero";
import TierProgress from "@/components/loyalty/TierProgress";
import TierJourney from "@/components/loyalty/TierJourney";
import RewardsSection from "@/components/loyalty/RewardsSection";
import ActivityLedger from "@/components/loyalty/ActivityLedger";
import HowItWorks from "@/components/loyalty/HowItWorks";
import NextAction from "@/components/loyalty/NextAction";
import GlowSkeleton from "@/components/loyalty/GlowSkeleton";
import { useAuth } from "@/context/AuthContext";
import {
  useLoyaltyAccount,
  useLoyaltyTransactions,
  useRewards,
  useTiers,
} from "@/api/loyalty";

export default function Loyalty() {
  const { user } = useAuth();
  const accountQ = useLoyaltyAccount();
  const tiersQ = useTiers();
  const rewardsQ = useRewards();
  const txQ = useLoyaltyTransactions();

  const loading = accountQ.isPending || tiersQ.isPending;
  const failed = accountQ.isError || tiersQ.isError;

  return (
    <div className="mx-auto max-w-4xl">
      {loading && <GlowSkeleton />}

      {failed && (
        <div className="py-10 text-center">
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Glow Points</p>
          <p className="mt-3 font-display text-2xl text-ink">We couldn't load your Glow Points.</p>
          <button
            onClick={() => { accountQ.refetch(); tiersQ.refetch(); }}
            className="mt-4 inline-flex min-h-[48px] items-center bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
          >
            Try again
          </button>
        </div>
      )}

      {accountQ.data && tiersQ.data && (
        <>
          <LoyaltyHero
            account={accountQ.data}
            tier={tiersQ.data.find((t) => t.name === accountQ.data.tier)}
            email={user?.email}
          />
          <TierProgress account={accountQ.data} tiers={tiersQ.data} />

          <div className="mt-10">
            <NextAction account={accountQ.data} tiers={tiersQ.data} rewards={rewardsQ.data ?? []} />
          </div>

          <div className="mt-12">
            {rewardsQ.isPending && <GlowSkeleton />}
            {rewardsQ.isError && (
              <div className="border border-ink/12 bg-white p-6">
                <p className="text-[15px] text-ink/70">Rewards aren't available right now.</p>
                <button onClick={() => rewardsQ.refetch()} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
                  Try again
                </button>
              </div>
            )}
            {rewardsQ.data && (
              <RewardsSection rewards={rewardsQ.data} balance={accountQ.data.pointsBalance} />
            )}
          </div>

          <div className="mt-12">
            <TierJourney tiers={tiersQ.data} current={accountQ.data.tier} />
          </div>

          <div className="mt-12">
            {txQ.isPending && <GlowSkeleton />}
            {txQ.isError && (
              <p className="text-[15px] text-ink/60">
                Activity isn't available right now — your points above are still current.
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
