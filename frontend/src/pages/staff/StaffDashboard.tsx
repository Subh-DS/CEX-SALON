import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AvailabilityTab from "@/components/staff/AvailabilityTab";
import { useMyBookings, useSetStatus } from "@/api/bookings";
import { useSaveNotes } from "@/api/admin";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function CustomerNotes({ id, name, initial }: { id?: string; name: string; initial: string | null | undefined }) {
  const save = useSaveNotes();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initial ?? "");
  if (!id) return null;
  if (!open) {
    return (
      <p className="mt-2 text-sm text-ink/60">
        {initial ? `Note: ${initial} ` : "No notes on this guest. "}
        <button
          onClick={() => { setDraft(initial ?? ""); setOpen(true); }}
          className="font-accent font-semibold text-primary underline-offset-4 hover:underline"
        >
          {initial ? "Edit" : "Add note"}
        </button>
      </p>
    );
  }
  return (
    <span className="mt-2 flex flex-col gap-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        maxLength={2000}
        aria-label={`Notes for ${name}`}
        className="border border-warmborder bg-ivory px-2.5 py-2 text-sm text-ink"
      />
      <span className="flex gap-2">
        <button
          onClick={async () => { await save.mutateAsync({ id, notes: draft }); setOpen(false); }}
          disabled={save.isPending}
          className="inline-flex min-h-[40px] items-center bg-primary px-4 font-accent text-[13px] font-semibold text-ivory disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save note"}
        </button>
        <button onClick={() => setOpen(false)} className="min-h-[40px] px-2 text-[13px] text-ink/60">Cancel</button>
      </span>
      {save.error && <span role="alert" className="text-[13px] text-[#b84444]">Couldn&apos;t save.</span>}
    </span>
  );
}

export default function StaffDashboard() {
  const [tab, setTab] = useState<"schedule" | "availability">("schedule");
  const { data, isPending, isError } = useMyBookings();
  const setStatus = useSetStatus();

  const today = (data ?? []).filter((b) => ["confirmed", "in_progress", "pending"].includes(b.status));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">Today</h1>
      <div className="mt-3 flex gap-2" role="tablist" aria-label="Staff sections">
        {(["schedule", "availability"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-[44px] rounded-pill border px-5 font-accent text-sm font-semibold capitalize ${
              tab === t ? "border-primary bg-primary text-white" : "border-warmborder bg-white text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "availability" ? (
        <div className="mt-4"><AvailabilityTab /></div>
      ) : (
        <>
          {isPending && <p className="mt-4 text-mutedbrown">Loading your schedule…</p>}
          {isError && <p className="mt-4 text-sm text-[#b84444]">We couldn&apos;t load your schedule. Please try again.</p>}
          {data && today.length === 0 && (
            <p className="mt-4 text-mutedbrown">Nothing scheduled. Enjoy the quiet.</p>
          )}
          <div className="mt-4 space-y-2.5">
            {today.map((b) =>
              b.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <span className="w-14 pt-3 font-accent text-[13px] font-bold text-ink">{fmtTime(item.start_time)}</span>
                  <div className="flex-1 rounded-md2 border border-warmborder bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b className="text-ink">{item.service_name} · {b.booking_number}</b>
                      <Badge tone="confirmed">{item.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink/65">
                      {b.customer_name ?? "Guest"}{b.customer_phone ? ` · ${b.customer_phone}` : ""}
                      {b.paid ? " · paid" : " · pay at visit"}
                    </p>
                    <CustomerNotes id={b.customer_id} name={b.customer_name ?? "guest"} initial={b.customer_notes} />
                    {item.status === "confirmed" && (
                      <div className="mt-2">
                        <Button
                          disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ booking_id: b.id, status: "in_progress" })}
                        >
                          Start
                        </Button>
                      </div>
                    )}
                    {item.status === "in_progress" && (
                      <div className="mt-2">
                        <Button
                          disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ booking_id: b.id, status: "completed" })}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
