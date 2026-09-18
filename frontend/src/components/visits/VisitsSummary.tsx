import { Link } from "react-router-dom";
import { parseVisitDate } from "./dates";
import type { LoyaltyAccount } from "@/types";

/** Compact personal summary — typography, not stat cards. */
export default function VisitsSummary({
  visitCount,
  nextIso,
  loyalty,
}: {
  visitCount: number;
  nextIso: string | null;
  loyalty: LoyaltyAccount | undefined;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-ink/12 pb-6">
      <p className="font-display text-[22px] text-ink">
        {visitCount} {visitCount === 1 ? "visit" : "visits"}
        <span className="text-ink/45 text-lg">
          {nextIso ? ` · next ${parseVisitDate(nextIso).full}` : " · nothing booked yet"}
        </span>
      </p>
      {loyalty && (
        <p className="font-accent text-[15px] text-ink/70">
          <b className="text-primary">{loyalty.pointsBalance.toLocaleString("en-IN")} Glow Points</b>
          {" · "}
          {loyalty.tier} member
          {" · "}
          <Link to="/loyalty" className="font-semibold text-primary underline-offset-4 hover:underline">
            View Glow Points →
          </Link>
        </p>
      )}
    </div>
  );
}
