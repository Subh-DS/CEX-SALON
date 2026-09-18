import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminCustomers, useCustomerActivity, useSaveNotes } from "@/api/admin";
import { useMyBookings } from "@/api/bookings";
import { useAuth } from "@/context/AuthContext";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";

export default function StaffCustomerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: customers } = useAdminCustomers();
  const { data: bookings } = useMyBookings();
  const activity = useCustomerActivity(id);
  const save = useSaveNotes();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const customer = customers?.find((c) => c.id === id);
  const history = (bookings ?? []).filter((b) => b.customer_id === id).slice().sort((a, b) =>
    (b.items[0]?.start_time ?? "").localeCompare(a.items[0]?.start_time ?? "")
  );

  if (!customer) return <p className="text-mutedbrown">Loading guest…</p>;

  async function submit() {
    await save.mutateAsync({ id: customer!.id, notes: draft });
    setEditing(false);
  }

  return (
    <div>
      <p className="text-sm text-ink/55">
        <Link to="/staff/customers" className="font-semibold text-primary underline-offset-4 hover:underline">Customers</Link>
        {" → "}{customer.name}
      </p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">{customer.name}</h1>
      <p className="mt-1 text-[15px] text-ink/60">
        {customer.email}{customer.phone ? ` · ${customer.phone}` : ""} · {customer.points} Glow Points{customer.tier ? ` · ${customer.tier}` : ""}
      </p>

      <div className="mt-4 rounded-md2 border border-warmborder bg-white p-5">
        <h2 className="font-display text-xl text-ink">Staff notes</h2>
        {editing ? (
          <span className="mt-2 flex flex-col gap-2">
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} maxLength={2000}
              aria-label={`Notes for ${customer.name}`}
              className="border border-warmborder bg-ivory px-2.5 py-2 text-sm text-ink"
            />
            <span className="flex gap-2">
              <button onClick={submit} disabled={save.isPending}
                className="inline-flex min-h-[40px] items-center bg-primary px-4 font-accent text-[13px] font-semibold text-ivory disabled:opacity-50">
                {save.isPending ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="min-h-[40px] px-2 text-[13px] text-ink/60">Cancel</button>
            </span>
          </span>
        ) : (
          <p className="mt-2 text-sm text-ink/70">
            {customer.notes ?? "No notes yet. Record sensitivities, formulas, preferences."}{" "}
            <button onClick={() => { setDraft(customer.notes ?? ""); setEditing(true); }}
              className="font-accent font-semibold text-primary underline-offset-4 hover:underline">
              {customer.notes ? "Edit" : "Add note"}
            </button>
          </p>
        )}
      </div>

      <div className="mt-4 rounded-md2 border border-warmborder bg-white">
        <h2 className="border-b border-warmborder px-4 py-3 font-display text-xl text-ink">
          {user?.role === "admin" ? "Visit history" : "Visits with you"}
        </h2>
        {history.length === 0 && <p className="px-4 py-4 text-sm text-ink/60">No visits on record.</p>}
        <ul className="divide-y divide-warmborder">
          {history.map((b) => {
            const item = b.items[0];
            const d = item ? parseVisitDate(item.start_time) : null;
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <span className="font-semibold text-ink">{d ? `${d.month} ${d.day} · ${d.time}` : b.booking_number}</span>
                <span className="text-ink/65">{item ? `${item.service_name} · ${formatINR(item.price)}` : ""}</span>
                <span className="ml-auto"><VisitStatus status={b.status} /></span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 rounded-md2 border border-warmborder bg-white">
        <h2 className="border-b border-warmborder px-4 py-3 font-display text-xl text-ink">Glow activity</h2>
        {activity.isPending && <p className="px-4 py-4 text-sm text-mutedbrown">Loading ledger…</p>}
        {activity.data && activity.data.transactions.length === 0 && (
          <p className="px-4 py-4 text-sm text-ink/60">No Glow activity yet.</p>
        )}
        <ul className="divide-y divide-warmborder">
          {(activity.data?.transactions ?? []).map((t) => (
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
    </div>
  );
}
