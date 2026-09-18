import { Link } from "react-router-dom";
import RewardsSection from "@/components/loyalty/RewardsSection";
import GlowSkeleton from "@/components/loyalty/GlowSkeleton";
import { useLoyaltyAccount, useRewards } from "@/api/loyalty";

/** Rewards shelf — shares the real catalog + redemption with Glow Points. */
export default function Rewards() {
  const accountQ = useLoyaltyAccount();
  const rewardsQ = useRewards();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Rewards</p>
      <h1 className="mt-2 font-display text-[34px] font-medium tracking-tight text-ink">
        Worth coming back for.
      </h1>
      {(accountQ.isPending || rewardsQ.isPending) && (
        <div className="mt-6"><GlowSkeleton /></div>
      )}
      {(accountQ.isError || rewardsQ.isError) && (
        <div className="mt-6 border border-ink/12 bg-white p-6">
          <p className="text-[15px] text-ink/70">Rewards aren't available right now.</p>
          <button onClick={() => { accountQ.refetch(); rewardsQ.refetch(); }} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Try again
          </button>
        </div>
      )}
      {accountQ.data && rewardsQ.data && (
        <div className="mt-6">
          <RewardsSection rewards={rewardsQ.data} balance={accountQ.data.pointsBalance} />
          <p className="mt-6 text-center text-sm text-ink/60">
            <Link to="/loyalty" className="font-semibold text-primary underline-offset-4 hover:underline">
              View your full Glow journey →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
