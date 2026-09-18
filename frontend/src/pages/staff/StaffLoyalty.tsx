import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCustomers, useCustomerActivity } from "@/api/admin";

export default function StaffLoyalty() {
  const { data: customers } = useAdminCustomers();
  const [id, setId] = useState("");
  const activity = useCustomerActivity(id || undefined);
  const selected = customers?.find((c) => c.id === id);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Loyalty</h1>
      <p className="mt-1 text-[15px] text-ink/60">
        Ledger-backed balances — points move only through visits, reviews, and redemptions.
      </p>
      <label className="mt-4 block max-w-sm text-sm font-semibold text-ink">Guest
        <select
          value={id} onChange={(e) => setId(e.target.value)}
          className="mt-1 min-h-[48px] w-full border border-warmborder bg-white px-3 text-[15px]"
        >
          <option value="">Choose a guest…</option>
          {(customers ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name} · {c.points} pts{c.tier ? ` · ${c.tier}` : ""}</option>
          ))}
        </select>
      </label>

      {selected && (
        <p className="mt-3 text-sm text-ink/65">
          <Link to={`/staff/customers/${selected.id}`} className="font-semibold text-primary underline-offset-4 hover:underline">
            {selected.name}
          </Link>
          {" — "}{selected.points} points{selected.tier ? ` · ${selected.tier} tier` : ""}
        </p>
      )}

      {activity.isPending && id && <p className="mt-3 text-mutedbrown">Loading ledger…</p>}
      {activity.data && (
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md2 border border-warmborder bg-white">
            <h2 className="border-b border-warmborder px-4 py-3 font-display text-xl text-ink">Ledger</h2>
            {activity.data.transactions.length === 0 && <p className="px-4 py-4 text-sm text-ink/60">No activity yet.</p>}
            <ul className="divide-y divide-warmborder">
              {activity.data.transactions.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
                  <b className={t.points >= 0 ? "text-leafgreen" : "text-ink"}>{t.points >= 0 ? `+${t.points}` : t.points}</b>
                  <span className="text-ink/65">{t.description}</span>
                  <span className="ml-auto text-[13px] text-ink/45">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md2 border border-warmborder bg-white">
            <h2 className="border-b border-warmborder px-4 py-3 font-display text-xl text-ink">Redemptions</h2>
            {activity.data.redemptions.length === 0 && <p className="px-4 py-4 text-sm text-ink/60">Nothing redeemed.</p>}
            <ul className="divide-y divide-warmborder">
              {activity.data.redemptions.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
                  <b className="text-ink">{r.reward}</b>
                  <span className="text-ink/65">−{r.points_spent} pts · code {r.code} · {r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
