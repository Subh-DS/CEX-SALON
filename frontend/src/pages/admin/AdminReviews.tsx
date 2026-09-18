import { useAdminReviews } from "@/api/admin";
import { parseVisitDate } from "@/components/visits/dates";

export default function AdminReviews() {
  const { data, isPending, isError } = useAdminReviews();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Reviews</h1>
      <p className="mt-1 text-[15px] text-ink/60">What guests said after completed visits.</p>
      {isPending && <p className="mt-4 text-mutedbrown">Loading reviews…</p>}
      {isError && <p role="alert" className="mt-4 text-sm text-[#b84444]">We couldn&apos;t load reviews. Try again.</p>}
      {data && data.length === 0 && <p className="mt-4 text-ink/60">No reviews yet.</p>}
      <ul className="mt-4 space-y-2.5">
        {(data ?? []).map((r) => (
          <li key={r.id} className="rounded-md2 border border-warmborder bg-white px-4 py-3">
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <b className="text-ink">★ {r.rating}{r.stylist_rating ? ` · stylist ${r.stylist_rating}` : ""}</b>
              <span className="text-[13px] text-ink/50">
                {r.customer ?? "Guest"}{r.created_at ? ` · ${parseVisitDate(r.created_at).full}` : ""}
              </span>
            </p>
            {r.comment && <p className="mt-1 text-sm text-ink/75">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
