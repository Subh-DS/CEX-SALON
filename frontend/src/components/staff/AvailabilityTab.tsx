import { useState } from "react";
import {
  useAddBlock,
  useMyAvailability,
  useMyBlocks,
  useRemoveBlock,
  useSaveAvailability,
  type DayHours,
} from "@/api/admin";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityTab() {
  const avail = useMyAvailability();
  const blocks = useMyBlocks();
  const save = useSaveAvailability();
  const addBlock = useAddBlock();
  const removeBlock = useRemoveBlock();
  const [days, setDays] = useState<DayHours[] | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  const rows = days ?? avail.data ?? [];
  const setDay = (i: number, patch: Partial<DayHours>) =>
    setDays((rows.map((d, j) => (j === i ? { ...d, ...patch } : d))));

  async function submit() {
    await save.mutateAsync(rows);
    setDays(null);
  }

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    await addBlock.mutateAsync({
      start_datetime: new Date(from).toISOString(),
      end_datetime: new Date(to).toISOString(),
      reason: reason.trim() || undefined,
    });
    setFrom(""); setTo(""); setReason("");
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Weekly hours</h2>
      <p className="mt-1 text-sm text-ink/60">Days off stay closed for booking. Changes apply to new bookings.</p>
      {avail.isPending && <p className="mt-3 text-mutedbrown">Loading your hours…</p>}
      {avail.isError && <p role="alert" className="mt-3 text-sm text-[#b84444]">We couldn&apos;t load your hours.</p>}
      {rows.length > 0 && (
        <ul className="mt-3 space-y-2">
          {rows.map((d, i) => (
            <li key={d.day_of_week} className="flex flex-wrap items-center gap-3 rounded-md2 border border-warmborder bg-white px-4 py-3">
              <label className="flex min-h-[44px] w-32 items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={d.is_active}
                  onChange={(e) => setDay(i, { is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                {DAYS[d.day_of_week]}
              </label>
              <input
                type="time" value={d.start_time} disabled={!d.is_active}
                onChange={(e) => setDay(i, { start_time: e.target.value })}
                aria-label={`${DAYS[d.day_of_week]} start`}
                className="min-h-[44px] border border-warmborder px-2 text-[15px] disabled:opacity-40"
              />
              <span aria-hidden="true" className="text-ink/40">–</span>
              <input
                type="time" value={d.end_time} disabled={!d.is_active}
                onChange={(e) => setDay(i, { end_time: e.target.value })}
                aria-label={`${DAYS[d.day_of_week]} end`}
                className="min-h-[44px] border border-warmborder px-2 text-[15px] disabled:opacity-40"
              />
            </li>
          ))}
        </ul>
      )}
      {save.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t save — check start is before end.</p>}
      <button
        onClick={submit}
        disabled={save.isPending || rows.length === 0}
        className="mt-3 inline-flex min-h-[48px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save hours"}
      </button>

      <h2 className="mt-8 font-display text-2xl text-ink">Time off</h2>
      <p className="mt-1 text-sm text-ink/60">Blocked periods never offer slots — training, leave, errands.</p>
      <ul className="mt-3 space-y-2">
        {(blocks.data ?? []).map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md2 border border-warmborder bg-white px-4 py-3 text-sm">
            <span className="text-ink">
              {new Date(b.start_datetime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              {" → "}
              {new Date(b.end_datetime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              {b.reason ? ` · ${b.reason}` : ""}
            </span>
            <button
              onClick={() => removeBlock.mutate(b.id)}
              className="font-accent text-[13px] font-semibold text-[#b84444] underline-offset-4 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
        {blocks.data?.length === 0 && <li className="text-sm text-ink/55">No time off scheduled.</li>}
      </ul>
      <form onSubmit={submitBlock} className="mt-3 flex max-w-xl flex-wrap items-end gap-2 rounded-md2 border border-warmborder bg-white p-4">
        <label className="text-sm font-semibold text-ink">From
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} required
            className="mt-1 block min-h-[44px] border border-warmborder px-2 text-[15px]" />
        </label>
        <label className="text-sm font-semibold text-ink">To
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} required
            className="mt-1 block min-h-[44px] border border-warmborder px-2 text-[15px]" />
        </label>
        <label className="text-sm font-semibold text-ink">Reason
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Training"
            className="mt-1 block min-h-[44px] border border-warmborder px-2 text-[15px]" />
        </label>
        <button disabled={addBlock.isPending} className="inline-flex min-h-[44px] items-center bg-primary px-5 font-accent text-sm font-semibold text-ivory disabled:opacity-50">
          {addBlock.isPending ? "Adding…" : "Block time"}
        </button>
      </form>
      {addBlock.error && <p role="alert" className="mt-2 text-sm text-[#b84444]">Couldn&apos;t block that time.</p>}
    </div>
  );
}
