import { useState } from "react";
import { useSaveService } from "@/api/admin";
import { useServices } from "@/api/bookings";
import { formatINR } from "@/lib/utils";

const EMPTY = { name: "", description: "", category: "Hair", duration_minutes: 60, price: 999, is_active: true };

export default function AdminServices() {
  const { data, isPending } = useServices();
  const save = useSaveService();
  const [form, setForm] = useState<{ id?: string } & typeof EMPTY>({ ...EMPTY });
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await save.mutateAsync({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category.trim(),
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      is_active: form.is_active,
    });
    setForm({ ...EMPTY });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Services</h1>
      {isPending && <p className="mt-4 text-mutedbrown">Loading services…</p>}
      <ul className="mt-4 space-y-2.5">
        {(data ?? []).map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md2 border border-warmborder bg-white px-4 py-3">
            <span>
              <b className="text-ink">{s.name}</b>
              <span className="block text-sm text-ink/60">
                {s.category} · {s.duration_minutes} min · {formatINR(s.price)}
              </span>
            </span>
            <button
              onClick={() => setForm({ id: s.id, name: s.name, description: s.description ?? "", category: s.category, duration_minutes: s.duration_minutes, price: s.price, is_active: true })}
              className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 max-w-lg rounded-md2 border border-warmborder bg-white p-5">
        <h2 className="font-display text-xl text-ink">{form.id ? "Edit service" : "New service"}</h2>
        <label className="mt-3 block text-sm font-semibold text-ink">Name
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-ink">Category
            <input value={form.category} onChange={(e) => set("category", e.target.value)} required
              className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
          </label>
          <label className="block text-sm font-semibold text-ink">Duration (min)
            <input type="number" min={5} max={480} value={form.duration_minutes} onChange={(e) => set("duration_minutes", Number(e.target.value))}
              className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
          </label>
        </div>
        <label className="mt-3 block text-sm font-semibold text-ink">Price (₹)
          <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-ink">Description
          <input value={form.description} onChange={(e) => set("description", e.target.value)}
            className="mt-1 min-h-[44px] w-full border border-warmborder px-3 text-[15px]" />
        </label>
        <label className="mt-3 flex min-h-[44px] items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4" />
          Bookable (shows on the menu)
        </label>
        {save.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t save. Check the values.</p>}
        <div className="mt-4 flex gap-2">
          <button disabled={save.isPending} className="inline-flex min-h-[48px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory disabled:opacity-50">
            {save.isPending ? "Saving…" : form.id ? "Save changes" : "Add service"}
          </button>
          {form.id && <button type="button" onClick={() => setForm({ ...EMPTY })} className="min-h-[48px] px-3 text-sm text-ink/60">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
