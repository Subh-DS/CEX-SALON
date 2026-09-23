import { useMemo, useState } from "react";
import { Clock3, IndianRupee, Pencil, Plus, Scissors } from "lucide-react";
import { useSaveService } from "@/api/admin";
import { useServices } from "@/api/bookings";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  AdminEmpty,
  AdminPageHeader,
  FieldLabel,
  Panel,
  SearchInput,
  adminInputCls,
} from "@/components/admin/AdminUI";

const EMPTY = { name: "", description: "", category: "Hair", duration_minutes: 60, price: 999, is_active: true };

export default function AdminServices() {
  const { data, isPending } = useServices();
  const save = useSaveService();
  const [form, setForm] = useState<{ id?: string } & typeof EMPTY>({ ...EMPTY });
  const [q, setQ] = useState("");
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const all = data ?? [];
    if (!needle) return all;
    return all.filter((s) => [s.name, s.category].join(" ").toLowerCase().includes(needle));
  }, [data, q]);

  const activeCount = (data ?? []).length; // API returns bookable services; show catalogue size honestly
  const editingName = form.id ? (data ?? []).find((s) => s.id === form.id)?.name : undefined;

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
      <AdminPageHeader
        eyebrow="Menu"
        title="Services"
        sub={`${activeCount} rituals on the menu · pricing in INR, duration in minutes.`}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-surfacewarm px-3.5 py-2 font-accent text-[13px] font-semibold text-ink/65">
            <Scissors className="h-4 w-4 text-marigold-deep" />
            {activeCount} live
          </span>
        }
      />

      <div className="mt-6">
        <SearchInput value={q} onChange={setQ} label="Search services" placeholder="Search ritual or category…" />
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
          <AdminEmpty title={q ? "No rituals match" : "No services yet"} sub="Add your first ritual below — name, time and price is all it takes." />
        </div>
      )}

      {list.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((s) => {
            const isEditing = form.id === s.id;
            return (
              <li
                key={s.id}
                className={cn(
                  "group flex items-start justify-between gap-3 rounded-md2 border bg-white p-4 shadow-sm2 transition-all hover:shadow-md2",
                  isEditing ? "border-primary ring-2 ring-primary-light/40" : "border-warmborder"
                )}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Scissors className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[15px] text-ink">{s.name}</b>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink/55">
                      <Badge tone="muted">{s.category}</Badge>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />{s.duration_minutes} min
                      </span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-ink">
                        <IndianRupee className="h-3.5 w-3.5" />{s.price.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] text-ink/50">{formatINR(s.price)}</span>
                  </span>
                </span>
                <button
                  onClick={() => setForm({ id: s.id, name: s.name, description: s.description ?? "", category: s.category, duration_minutes: s.duration_minutes, price: s.price, is_active: true })}
                  aria-label={`Edit ${s.name}`}
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

      <Panel
        title={form.id ? `Edit ritual${editingName ? ` · ${editingName}` : ""}` : "New ritual"}
        sub={form.id ? "Changes go live on the booking menu instantly." : "Add a ritual to the booking menu."}
        className="mt-6 max-w-2xl"
      >
        <form onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="block sm:col-span-2">
              <FieldLabel htmlFor="svc-name">Name</FieldLabel>
              <input id="svc-name" value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2}
                placeholder="e.g. Signature Hair Spa" className={adminInputCls} />
            </div>
            <div className="block">
              <FieldLabel htmlFor="svc-category">Category</FieldLabel>
              <input id="svc-category" value={form.category} onChange={(e) => set("category", e.target.value)} required
                placeholder="Hair, Skin, Nails…" className={adminInputCls} />
            </div>
            <div className="block">
              <FieldLabel htmlFor="svc-duration">Duration (min)</FieldLabel>
              <input id="svc-duration" type="number" min={5} max={480} value={form.duration_minutes} onChange={(e) => set("duration_minutes", Number(e.target.value))}
                className={adminInputCls} />
            </div>
            <div className="block">
              <FieldLabel htmlFor="svc-price">Price (₹)</FieldLabel>
              <input id="svc-price" type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))}
                className={adminInputCls} />
            </div>
            <div className="block">
              <FieldLabel htmlFor="svc-desc">Description</FieldLabel>
              <input id="svc-desc" value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Short, guest-facing line" className={adminInputCls} />
            </div>
          </div>
          <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-5 w-5 accent-[#3b2038]" />
            Bookable — shows on the guest menu
          </label>
          {save.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t save. Check the values and try again.</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button disabled={save.isPending} className="inline-flex min-h-[48px] items-center gap-2 rounded-pill bg-primary px-7 font-accent text-sm font-semibold text-white shadow-sm2 transition-colors hover:bg-plum-deep disabled:opacity-50">
              {form.id ? null : <Plus className="h-4 w-4" />}
              {save.isPending ? "Saving…" : form.id ? "Save changes" : "Add ritual"}
            </button>
            {form.id && <button type="button" onClick={() => setForm({ ...EMPTY })} className="min-h-[48px] rounded-pill px-4 text-sm font-medium text-ink/60 hover:text-ink">Cancel</button>}
          </div>
        </form>
      </Panel>
    </div>
  );
}
