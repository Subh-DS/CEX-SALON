import { useState } from "react";
import { useSaveReward, useAdminRewards } from "@/api/admin";

const EMPTY = { name: "", description: "", points_cost: 100, is_active: true };

export default function AdminRewards() {
  const { data, isPending } = useAdminRewards();
  const save = useSaveReward();
  const [form, setForm] = useState<{ id?: string } & typeof EMPTY>({ ...EMPTY });
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

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
      <h1 className="font-display text-3xl text-ink">Rewards</h1>
      {isPending && <p className="mt-4 text-mutedbrown">Loading rewards…</p>}
      <ul className="mt-4 space-y-2.5">
        {(data ?? []).map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md2 border border-warmborder bg-white px-4 py-3">
            <span>
              <b className="text-ink">{r.name}</b>
              <span className="block text-sm text-ink/60">{r.points_cost} pts{r.is_active ? "" : " · hidden"}</span>
            </span>
            <button
              onClick={() => setForm({ id: r.id, name: r.name, description: r.description ?? "", points_cost: r.points_cost, is_active: r.is_active })}
              className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 max-w-lg rounded-md2 border border-warmborder bg-white p-5">
        <h2 className="font-display text-xl text-ink">{form.id ? "Edit reward" : "New reward"}</h2>
        <label className="mt-3 block text-sm font-semibold text-ink">Name
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-ink">Description
          <input value={form.description} onChange={(e) => set("description", e.target.value)}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-ink">Points cost
          <input type="number" min={1} value={form.points_cost} onChange={(e) => set("points_cost", Number(e.target.value))}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <label className="mt-3 flex min-h-[44px] items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4" />
          Visible to customers
        </label>
        {save.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t save. Check the values.</p>}
        <div className="mt-4 flex gap-2">
          <button disabled={save.isPending} className="inline-flex min-h-[48px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory disabled:opacity-50">
            {save.isPending ? "Saving…" : form.id ? "Save changes" : "Add reward"}
          </button>
          {form.id && <button type="button" onClick={() => setForm({ ...EMPTY })} className="min-h-[48px] px-3 text-sm text-ink/60">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
