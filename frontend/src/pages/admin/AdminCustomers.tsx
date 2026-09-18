import { useState } from "react";
import { useAdminCustomers, useSaveNotes } from "@/api/admin";

export default function AdminCustomers() {
  const { data, isPending, isError } = useAdminCustomers();
  const save = useSaveNotes();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function submit(id: string) {
    await save.mutateAsync({ id, notes: draft });
    setEditing(null);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Customers</h1>
      <p className="mt-1 text-[15px] text-ink/60">Notes are internal — visible to staff and admin only.</p>
      {isPending && <p className="mt-4 text-mutedbrown">Loading customers…</p>}
      {isError && <p role="alert" className="mt-4 text-sm text-[#b84444]">We couldn&apos;t load customers. Try again.</p>}
      {data && data.length === 0 && <p className="mt-4 text-ink/60">No customers yet.</p>}
      {data && data.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-md2 border border-warmborder bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-surfacewarm text-left font-accent text-xs uppercase text-mutedbrown">
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5">Visits</th>
                <th className="px-4 py-2.5">Glow</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-t border-warmborder align-top">
                  <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink/70">{c.email}<br />{c.phone ?? ""}</td>
                  <td className="px-4 py-3 text-ink/70">{c.bookings}</td>
                  <td className="px-4 py-3 text-ink/70">{c.points} pts{c.tier ? ` · ${c.tier}` : ""}</td>
                  <td className="px-4 py-3">
                    {editing === c.id ? (
                      <span className="flex flex-col gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={2}
                          maxLength={2000}
                          aria-label={`Notes for ${c.name}`}
                          className="w-56 border border-warmborder bg-ivory px-2.5 py-2 text-sm text-ink"
                        />
                        <span className="flex gap-2">
                          <button
                            onClick={() => submit(c.id)}
                            disabled={save.isPending}
                            className="inline-flex min-h-[40px] items-center bg-primary px-4 font-accent text-[13px] font-semibold text-ivory disabled:opacity-50"
                          >
                            {save.isPending ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditing(null)} className="min-h-[40px] px-2 text-[13px] text-ink/60">
                            Cancel
                          </button>
                        </span>
                        {save.error && <span role="alert" className="text-[13px] text-[#b84444]">Couldn&apos;t save.</span>}
                      </span>
                    ) : (
                      <span className="flex items-start gap-2">
                        <span className="max-w-56 text-ink/70">{c.notes || <i className="text-ink/40">No notes</i>}</span>
                        <button
                          onClick={() => { setEditing(c.id); setDraft(c.notes ?? ""); }}
                          className="shrink-0 font-accent text-[13px] font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          {c.notes ? "Edit" : "Add"}
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
