import { useMemo } from "react";
import { MessageSquareHeart, Star } from "lucide-react";
import { useAdminReviews } from "@/api/admin";
import { parseVisitDate } from "@/components/visits/dates";
import { cn } from "@/lib/utils";
import {
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  Panel,
} from "@/components/admin/AdminUI";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < value ? "fill-[#c99a2e] text-[#c99a2e]" : "fill-surfacewarm text-warmborder")}
        />
      ))}
    </span>
  );
}

function guestInitials(name: string | null): string {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "G").slice(0, 2);
}

export default function AdminReviews() {
  const { data, isPending, isError, refetch } = useAdminReviews();

  const summary = useMemo(() => {
    const rows = data ?? [];
    if (rows.length === 0) return null;
    const avg = rows.reduce((a, r) => a + r.rating, 0) / rows.length;
    const five = rows.filter((r) => r.rating >= 5).length;
    return { count: rows.length, avg, fiveShare: Math.round((five / rows.length) * 100) };
  }, [data]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Voice of guest"
        title="Reviews"
        sub="Unfiltered words after completed visits — celebrate experts, spot patterns."
      />

      {summary && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md2 border border-warmborder bg-white p-5 shadow-sm2">
            <p className="font-accent text-[11px] font-bold uppercase tracking-[0.14em] text-mutedbrown">Average rating</p>
            <p className="mt-1 flex items-center gap-2 font-display text-3xl text-ink">
              {summary.avg.toFixed(1)}
              <Stars value={Math.round(summary.avg)} />
            </p>
          </div>
          <div className="rounded-md2 border border-warmborder bg-white p-5 shadow-sm2">
            <p className="font-accent text-[11px] font-bold uppercase tracking-[0.14em] text-mutedbrown">Total reviews</p>
            <p className="mt-1 font-display text-3xl text-ink">{summary.count}</p>
            <p className="mt-1 text-[13px] text-ink/55">Across all completed visits</p>
          </div>
          <div className="rounded-md2 border border-warmborder bg-white p-5 shadow-sm2">
            <p className="font-accent text-[11px] font-bold uppercase tracking-[0.14em] text-mutedbrown">Five-star share</p>
            <p className="mt-1 font-display text-3xl text-ink">{summary.fiveShare}%</p>
            <p className="mt-1 text-[13px] text-ink/55">Guests who left full love</p>
          </div>
        </div>
      )}

      <Panel title="Latest love" sub={data?.length ? `${data.length} notes from guests` : undefined} className="mt-4">
        {isPending && (
          <div className="grid animate-pulse gap-3" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-surfacewarm/70" />
            ))}
          </div>
        )}
        {isError && <AdminError message="We couldn't load reviews." onRetry={() => refetch()} />}
        {!isPending && !isError && (!data || data.length === 0) && (
          <AdminEmpty icon={MessageSquareHeart} title="No reviews yet" sub="After the first completed visits, guest words and star ratings will gather here." />
        )}
        <ul className="grid gap-3 md:grid-cols-2">
          {(data ?? []).map((r) => (
            <li key={r.id} className="flex flex-col gap-2.5 rounded-xl border border-warmborder/80 bg-ivory/50 p-4 transition-shadow hover:shadow-sm2">
              <p className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={r.rating} />
                {r.stylist_rating ? (
                  <span className="rounded-pill bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary">
                    Expert {r.stylist_rating}/5
                  </span>
                ) : null}
              </p>
              {r.comment ? (
                <p className="text-[15px] leading-relaxed text-ink/80">“{r.comment}”</p>
              ) : (
                <p className="text-sm italic text-ink/40">No written note — stars only.</p>
              )}
              {r.tags ? (
                <p className="flex flex-wrap gap-1.5">
                  {r.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span key={t} className="rounded-pill bg-white px-2.5 py-1 text-xs font-medium text-ink/60 ring-1 ring-warmborder">
                      {t}
                    </span>
                  ))}
                </p>
              ) : null}
              <p className="mt-auto flex items-center gap-2.5 border-t border-warmborder/60 pt-3">
                <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-accent text-xs font-bold text-primary">
                  {guestInitials(r.customer)}
                </span>
                <span className="text-[13px] font-semibold text-ink/75">{r.customer ?? "Guest"}</span>
                {r.created_at && (
                  <span className="ml-auto text-xs text-ink/45">{parseVisitDate(r.created_at).full}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
