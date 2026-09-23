import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NextVisit from "@/components/visits/NextVisit";
import VisitHistoryItem from "@/components/visits/VisitHistoryItem";
import UsualCard, { computeUsual } from "@/components/visits/UsualCard";
import VisitsSummary from "@/components/visits/VisitsSummary";
import VisitsSkeleton from "@/components/visits/VisitsSkeleton";
import { useMyBookings } from "@/api/bookings";
import { useLoyaltyAccount, useLoyaltyTransactions, useMyReviews } from "@/api/loyalty";
import type { Booking } from "@/types";

const ACTIVE = ["pending", "confirmed", "in_progress"];

function startOf(b: Booking): number {
  return new Date(b.items[0]?.start_time ?? 0).getTime();
}

export default function CustomerDashboard() {
  const bookingsQ = useMyBookings();
  const reviewsQ = useMyReviews();
  const loyaltyQ = useLoyaltyAccount();
  const txQ = useLoyaltyTransactions();
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all");
  const [showAll, setShowAll] = useState(false);

  const data = useMemo(() => bookingsQ.data ?? [], [bookingsQ.data]);
  const reviewedIds = useMemo(
    () => new Set((reviewsQ.data ?? []).map((r) => r.booking_id)),
    [reviewsQ.data]
  );
  const pointsByBooking = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txQ.data ?? []) {
      if (t.reference_type === "booking" && t.points > 0) map.set(t.reference_id, t.points);
    }
    return map;
  }, [txQ.data]);

  const upcoming = useMemo(
    () => data.filter((b) => ACTIVE.includes(b.status)).sort((a, b) => startOf(a) - startOf(b)),
    [data]
  );
  const next = upcoming[0] ?? null;
  const later = upcoming.slice(1);
  const past = useMemo(
    () => data.filter((b) => !ACTIVE.includes(b.status)).sort((a, b) => startOf(b) - startOf(a)),
    [data]
  );
  const usual = useMemo(() => computeUsual(data), [data]);

  const filteredPast = useMemo(() => {
    if (filter === "completed") return past.filter((b) => b.status === "completed");
    if (filter === "cancelled") return past.filter((b) => b.status !== "completed");
    return past;
  }, [past, filter]);
  const visiblePast = showAll ? filteredPast : filteredPast.slice(0, 6);

  const lastCompleted = past.find((b) => b.status === "completed");
  const nudge = useMemo(() => {
    if (!lastCompleted) return null;
    const days = Math.round((Date.now() - startOf(lastCompleted)) / 86400000);
    if (days < 28) return null;
    return `Your last ${lastCompleted.items[0]?.service_name ?? "visit"} was ${days} days ago — ready for another?`;
  }, [lastCompleted]);

  if (bookingsQ.isPending) {
    return (
      <div className="mx-auto max-w-3xl">
        <VisitsSkeleton />
      </div>
    );
  }

  if (bookingsQ.isError) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <h1 className="font-display text-3xl text-ink">Your visits</h1>
        <p className="mt-3 text-ink/65">We couldn't load your visits.</p>
        <button
          onClick={() => bookingsQ.refetch()}
          className="mt-4 inline-flex min-h-[48px] items-center bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">My visits</p>
      <h1 className="mt-2 font-display text-[34px] font-medium tracking-tight text-ink">
        Your time at The Blush Studio.
      </h1>

      <VisitsSummary
        visitCount={data.length}
        nextIso={next?.items[0]?.start_time ?? null}
        loyalty={loyaltyQ.data}
      />

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            No upcoming visits
          </p>
          <p className="mx-auto mt-3 max-w-sm font-display text-2xl text-ink">
            Nothing booked yet. Whenever you're ready, we'll be here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/book"
              className="inline-flex min-h-[52px] items-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep"
            >
              Book an appointment
            </Link>
            <Link
              to="/services"
              className="inline-flex min-h-[52px] items-center border-b-2 border-ink px-1 font-accent text-[15px] font-semibold text-ink hover:border-primary hover:text-primary"
            >
              Explore services
            </Link>
          </div>
        </div>
      ) : (
        <>
          {next && (
            <div className="mt-8">
              <NextVisit booking={next} />
            </div>
          )}

          {later.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-medium text-ink">Also coming up</h2>
              <div className="mt-3 border-t border-ink/10">
                {later.map((b) => (
                  <VisitHistoryItem
                    key={b.id}
                    booking={b}
                    reviewed={reviewedIds.has(b.id)}
                    earnedPoints={pointsByBooking.get(b.id) ?? null}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-medium text-ink">Visit history</h2>
              {past.length > 3 && (
                <div className="flex gap-1" role="group" aria-label="Filter visit history">
                  {(["all", "completed", "cancelled"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setShowAll(false); }}
                      aria-pressed={filter === f}
                      className={`min-h-[44px] px-4 font-accent text-[13px] font-semibold capitalize ${
                        filter === f ? "bg-primary text-ivory" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filteredPast.length === 0 ? (
              <p className="mt-3 text-[15px] text-ink/60">
                {past.length === 0
                  ? "Your first visit starts here — completed visits will show up."
                  : "Nothing in this view."}
              </p>
            ) : (
              <div className="mt-1 border-b border-ink/10">
                {visiblePast.map((b) => (
                  <VisitHistoryItem
                    key={b.id}
                    booking={b}
                    reviewed={reviewedIds.has(b.id)}
                    earnedPoints={pointsByBooking.get(b.id) ?? null}
                  />
                ))}
              </div>
            )}
            {!showAll && filteredPast.length > 6 && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-3 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Show all {filteredPast.length} visits
              </button>
            )}
          </div>

          {nudge && (
            <p className="mt-8 border-l-2 border-marigold pl-4 text-[15px] text-ink/75">{nudge}</p>
          )}

          {usual && (
            <div className="mt-6">
              <UsualCard usual={usual} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
