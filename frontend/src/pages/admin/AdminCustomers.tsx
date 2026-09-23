import { useMemo, useState } from "react";
import { NotebookPen, Sparkles, Users } from "lucide-react";
import { useAdminCustomers, useSaveNotes } from "@/api/admin";
import Badge from "@/components/ui/Badge";
import {
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  SearchInput,
  SkeletonTable,
  TableHead,
  TableWrap,
  Th,
} from "@/components/admin/AdminUI";

function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "G").slice(0, 2);
}

export default function AdminCustomers() {
  const { data, isPending, isError, refetch } = useAdminCustomers();
  const save = useSaveNotes();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");

  async function submit(id: string) {
    await save.mutateAsync({ id, notes: draft });
    setEditing(null);
  }

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data ?? [];
    return (data ?? []).filter((c) =>
      [c.name, c.email, c.phone ?? ""].join(" ").toLowerCase().includes(needle)
    );
  }, [data, q]);

  const totalVisits = (data ?? []).reduce((a, c) => a + c.bookings, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Relationships"
        title="Guests"
        sub={`${data?.length ?? 0} customers · ${totalVisits} visits · notes stay internal to staff & admin.`}
      />

      <div className="mt-6">
        <SearchInput value={q} onChange={setQ} label="Search guests" placeholder="Search name, email or phone…" />
      </div>

      <div className="mt-4">
        {isPending && <SkeletonTable />}
        {isError && <AdminError message="We couldn't load guests." onRetry={() => refetch()} />}
        {!isPending && !isError && rows.length === 0 && (
          <AdminEmpty
            icon={Users}
            title={q ? "No guests match your search" : "No guests yet"}
            sub={q ? "Try a different spelling or phone number." : "New customers will appear here after signup."}
          />
        )}
        {rows.length > 0 && (
          <TableWrap minWidth={820}>
            <TableHead>
              <Th>Guest</Th>
              <Th>Contact</Th>
              <Th>Visits</Th>
              <Th>Glow</Th>
              <Th>Notes</Th>
            </TableHead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-warmborder/70 align-top transition-colors hover:bg-ivory/70">
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-3">
                      <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-accent text-[13px] font-bold text-primary">
                        {guestInitials(c.name)}
                      </span>
                      <span className="font-semibold text-ink">{c.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] leading-relaxed text-ink/65">
                    <span className="block">{c.email}</span>
                    {c.phone && <span className="text-ink/50">{c.phone}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex min-h-[28px] items-center rounded-pill bg-surfacewarm px-3 font-accent text-[13px] font-bold text-ink">
                      {c.bookings}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <Sparkles className="h-3.5 w-3.5 text-marigold-deep" />
                      {c.points} pts
                    </span>
                    <span className="mt-1 block">
                      <Badge tone={c.tier ? "gold" : "muted"}>{c.tier ?? "Seed"}</Badge>
                    </span>
                  </td>
                  <td className="min-w-[240px] px-4 py-3.5">
                    {editing === c.id ? (
                      <span className="flex flex-col gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={2}
                          maxLength={2000}
                          aria-label={`Notes for ${c.name}`}
                          placeholder="Allergies, favourite expert, formula…"
                          className="w-full min-w-56 rounded-sm2 border border-primary-light bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-light/50"
                        />
                        <span className="flex items-center gap-2">
                          <button
                            onClick={() => submit(c.id)}
                            disabled={save.isPending}
                            className="inline-flex min-h-[40px] items-center rounded-pill bg-primary px-5 font-accent text-[13px] font-semibold text-white transition-colors hover:bg-plum-deep disabled:opacity-50"
                          >
                            {save.isPending ? "Saving…" : "Save note"}
                          </button>
                          <button onClick={() => setEditing(null)} className="min-h-[40px] px-2 text-[13px] font-medium text-ink/55 hover:text-ink">
                            Cancel
                          </button>
                        </span>
                        {save.error && <span role="alert" className="text-[13px] text-[#b84444]">Couldn&apos;t save — try again.</span>}
                      </span>
                    ) : (
                      <span className="flex items-start gap-2">
                        <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-ink/30" />
                        <span className="max-w-56 text-sm text-ink/70">{c.notes || <i className="text-ink/40">No notes yet</i>}</span>
                        <button
                          onClick={() => { setEditing(c.id); setDraft(c.notes ?? ""); }}
                          className="shrink-0 rounded-pill px-2 py-1 font-accent text-[13px] font-semibold text-primary hover:bg-primary/8 hover:underline underline-offset-4"
                        >
                          {c.notes ? "Edit" : "Add"}
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </div>
    </div>
  );
}
