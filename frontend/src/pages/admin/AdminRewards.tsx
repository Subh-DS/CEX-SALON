import { useMemo, useState } from "react";
import { EyeOff, Gift, Pencil, Plus, Sparkles } from "lucide-react";
import { useSaveReward, useAdminRewards } from "@/api/admin";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  AdminEmpty,
  AdminPageHeader,
  FieldLabel,
  Panel,
  SearchInput,
  adminInputCls,
} from "@/components/admin/AdminUI";

const EMPTY = { name: "", description: "", points_cost: 100, is_active: true };

export default function AdminRewards() {
  const { data, isPending } = useAdminRewards();
  const save = useSaveReward();
  const [form, setForm] = useState<{ id?: string } & typeof EMPTY>({ ...EMPTY });
  const [q, setQ] = useState("");
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data ?? [];
    return (data ?? []).filter((r) => r.name.toLowerCase().includes(needle));
  }, [data, q]);

  const visibleCount = (data ?? []).filter((r) => r.is_active).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await save.mutateAsync({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      points_cost: Number(form.points_cost),
      is_active: form.is_active,
    });
    setForm({ ...EMPTY });
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Loyalty"
        title="Glow rewards"
        sub={`${visibleCount} of ${data?.length ?? 0} rewards visible to guests · earned points turn into rituals.`}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#f6e7e1] px-3.5 py-2 font-accent text-[13px] font-semibold text-marigold-deep">
            <Sparkles className="h-4 w-4" />
            {visibleCount} live
          </span>
        }
      />

      <div className="mt-6">
        <SearchInput value={q} onChange={setQ} label="Search rewards" placeholder="Search reward…" />
      </div>

      {isPending && (
        <div className="mt-4 grid animate-pulse gap-3 sm:grid-cols-2" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-md2 border border-warmborder bg-white" />
          ))}
        </div>
      )}

      {!isPending && list.length === 0 && (
        <div className="mt-4">
          <AdminEmpty icon={Gift} title={q ? "No rewards match" : "No rewards yet"} sub="Create the first glow — a free blowout, a mini facial, a festive gift." />
        </div>
      )}

      {list.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((r) => {
            const isEditing = form.id === r.id;
            return (
              <li
                key={r.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-md2 border bg-white p-4 shadow-sm2 transition-all hover:shadow-md2",
                  isEditing ? "border-primary ring-2 ring-primary-light/40" : "border-warmborder"
                )}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f6e7e1] text-marigold-deep">
                    <Gift className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[15px] text-ink">{r.name}</b>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="gold">{r.points_cost} pts</Badge>
                      {!r.is_active && (
                        <Badge tone="muted">
                          <span className="inline-flex items-center gap-1">
                            <EyeOff className="h-3 w-3" /> hidden
                          </span>
                        </Badge>
                      )}
                    </span>
                    {r.description && <span className="mt-1 block truncate text-[13px] text-ink/50">{r.description}</span>}
                  </span>
                </span>
                <button
                  onClick={() => setForm({ id: r.id, name: r.name, description: r.description ?? "", points_cost: r.points_cost, is_active: r.is_active })}
                  aria-label={`Edit ${r.name}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-warmborder px-3.5 py-2 font-accent text-[13px] font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Panel title={form.id ? "Edit reward" : "New reward"} sub="Points cost sets the glow-value — keep heroes within reach." className="mt-6 max-w-2xl">
        <form onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="block sm:col-span-2">
              <FieldLabel htmlFor="rwd-name">Name</FieldLabel>
              <input id="rwd-name" value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2}
                placeholder="e.g. Glow Mini Facial" className={adminInputCls} />
            </div>
            <div className="block sm:col-span-2">
              <FieldLabel htmlFor="rwd-desc">Description</FieldLabel>
              <input id="rwd-desc" value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="What the guest gets, in one line" className={adminInputCls} />
            </div>
            <div className="block">
              <FieldLabel htmlFor="rwd-points">Points cost</FieldLabel>
              <input id="rwd-points" type="number" min={1} value={form.points_cost} onChange={(e) => set("points_cost", Number(e.target.value))}
                className={adminInputCls} />
            </div>
            <label className="mt-6 flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-5 w-5 accent-[#3b2038]" />
              Visible to guests
            </label>
          </div>
          {save.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t save. Check the values and try again.</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button disabled={save.isPending} className="inline-flex min-h-[48px] items-center gap-2 rounded-pill bg-primary px-7 font-accent text-sm font-semibold text-white shadow-sm2 transition-colors hover:bg-plum-deep disabled:opacity-50">
              {form.id ? null : <Plus className="h-4 w-4" />}
              {save.isPending ? "Saving…" : form.id ? "Save changes" : "Add reward"}
            </button>
            {form.id && <button type="button" onClick={() => setForm({ ...EMPTY })} className="min-h-[48px] rounded-pill px-4 text-sm font-medium text-ink/60 hover:text-ink">Cancel</button>}
          </div>
        </form>
      </Panel>
    </div>
  );
}
