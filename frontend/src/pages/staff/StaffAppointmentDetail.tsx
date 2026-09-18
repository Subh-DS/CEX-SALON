import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBooking } from "@/api/admin";
import { useCancelBooking, useSetStatus } from "@/api/bookings";
import CancelVisitDialog from "@/components/visits/CancelVisitDialog";
import ReschedulePane from "@/components/visits/ReschedulePane";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";

const NEXT: Record<string, { status: string; label: string }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm appointment" },
    { status: "cancelled", label: "Cancel appointment" },
  ],
  confirmed: [
    { status: "in_progress", label: "Start appointment" },
    { status: "cancelled", label: "Cancel appointment" },
  ],
  in_progress: [
    { status: "completed", label: "Mark completed" },
    { status: "no_show", label: "Mark no-show" },
  ],
};

export default function StaffAppointmentDetail() {
  const { id } = useParams();
  const { data: booking, isPending, isError } = useBooking(id);
  const setStatus = useSetStatus();
  const cancel = useCancelBooking();
  const [rescheduling, setRescheduling] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function apply(status: string) {
    if (!booking) return;
    try {
      const res = await setStatus.mutateAsync({ booking_id: booking.id, status });
      setConfirming(null);
      setToast(
        status === "completed" && res.points_awarded > 0
          ? `Completed — guest earned ${res.points_awarded} Glow Points.`
          : `Appointment ${status.replace("_", " ")}.`
      );
    } catch {
      /* error below */
    }
  }

  async function applyCancel() {
    if (!booking) return;
    try {
      await cancel.mutateAsync(booking.id);
      setConfirming(null);
      setToast("Appointment cancelled. The guest sees the update in My Visits.");
    } catch {
      /* error in dialog */
    }
  }

  if (isPending) return <p className="text-mutedbrown">Loading appointment…</p>;
  if (isError || !booking)
    return (
      <p role="alert" className="text-sm text-[#b84444]">
        We couldn&apos;t load this appointment. <Link to="/staff/appointments" className="underline">Back to list</Link>
      </p>
    );

  const item = booking.items[0];
  const d = item ? parseVisitDate(item.start_time) : null;
  const actions = NEXT[booking.status] ?? [];
  const canReschedule = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div>
      <p className="text-sm text-ink/55">
        <Link to="/staff/appointments" className="font-semibold text-primary underline-offset-4 hover:underline">Appointments</Link>
        {" → "}{booking.booking_number}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          {item?.service_name ?? "Appointment"}
        </h1>
        <VisitStatus status={booking.status} />
      </div>

      <dl className="mt-4 grid gap-3 rounded-md2 border border-warmborder bg-white p-5 text-sm sm:grid-cols-2">
        {[
          ["Guest", `${booking.customer_name ?? "Guest"}${booking.customer_phone ? ` · ${booking.customer_phone}` : ""}`],
          ["When", d ? `${d.full} · ${d.time}` : "—"],
          ["Duration", item ? `${item.duration_minutes} min` : "—"],
          ["Price", `${formatINR(booking.total_amount)}${booking.paid ? " · paid" : " · pay at visit"}`],
          ["Booking no.", booking.booking_number],
          ["Where", booking.branch_name ?? "Patia, Bhubaneswar"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-accent text-xs uppercase tracking-wide text-mutedbrown">{k}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {booking.customer_notes && (
        <p className="mt-3 rounded-md2 border border-warmborder bg-white px-4 py-3 text-sm text-ink/75">
          <b>Guest note:</b> {booking.customer_notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {actions
          .filter((a) => a.status !== "cancelled")
          .map((a) => (
            <button
              key={a.status}
              onClick={() => setConfirming(a.status)}
              disabled={setStatus.isPending}
              className="inline-flex min-h-[48px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep disabled:opacity-50"
            >
              {a.label}
            </button>
          ))}
        {canReschedule && (
          <button
            onClick={() => setRescheduling((v) => !v)}
            className="inline-flex min-h-[48px] items-center border border-ink px-6 font-accent text-sm font-semibold text-ink hover:bg-ink hover:text-ivory"
          >
            Reschedule
          </button>
        )}
        {actions.some((a) => a.status === "cancelled") && (
          <button
            onClick={() => setConfirming("cancelled")}
            className="inline-flex min-h-[48px] items-center px-4 font-accent text-sm text-ink/60 underline-offset-4 hover:text-[#b84444] hover:underline"
          >
            Cancel appointment
          </button>
        )}
      </div>
      {setStatus.error && (
        <p role="alert" className="mt-2 text-sm text-[#b84444]">
          {(setStatus.error as { message?: string }).message ?? "Couldn't update. Please try again."}
        </p>
      )}

      {rescheduling && canReschedule && (
        <div className="mt-2 rounded-md2 border border-warmborder bg-white px-4 pb-4">
          <ReschedulePane booking={booking} onDone={() => { setRescheduling(false); setToast("Appointment rescheduled."); }} />
        </div>
      )}

      {(booking.status_history ?? []).length > 0 && (
        <div className="mt-4 rounded-md2 border border-warmborder bg-white p-5">
          <h2 className="font-display text-xl text-ink">History</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
            {booking.status_history!.map((h, i) => (
              <li key={i}>
                {h.status.replace("_", " ")}{h.reason ? ` — ${h.reason}` : ""}
                {h.created_at ? ` · ${new Date(h.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {confirming && confirming !== "cancelled" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setConfirming(null)} role="presentation">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-md bg-white p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl text-ink">
              {confirming === "completed" ? "Mark this visit completed?" : `${NEXT[booking.status]?.find((a) => a.status === confirming)?.label}?`}
            </h3>
            <p className="mt-2 text-[15px] text-ink/70">
              {item?.service_name} for {booking.customer_name ?? "the guest"}
              {d ? ` on ${d.full} at ${d.time}` : ""}.
              {confirming === "completed" && " The guest will earn Glow Points for this visit."}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setConfirming(null)} className="inline-flex min-h-[48px] items-center justify-center border border-ink px-6 font-accent text-sm font-semibold">
                Keep as is
              </button>
              <button
                onClick={() => apply(confirming)}
                disabled={setStatus.isPending}
                className="inline-flex min-h-[48px] items-center justify-center bg-primary px-6 font-accent text-sm font-semibold text-white disabled:opacity-60"
              >
                {setStatus.isPending ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirming === "cancelled" && (
        <CancelVisitDialog
          serviceName={item?.service_name ?? "Appointment"}
          staffName={booking.customer_name ?? "guest"}
          iso={item?.start_time ?? new Date().toISOString()}
          busy={cancel.isPending}
          error={cancel.error ? "We couldn't cancel right now. Please try again." : null}
          onKeep={() => setConfirming(null)}
          onConfirm={applyCancel}
        />
      )}

      {toast && (
        <p role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink px-5 py-3 font-accent text-sm font-semibold text-ivory shadow-lg2">
          {toast}
          <button onClick={() => setToast(null)} aria-label="Dismiss" className="ml-3 text-ivory/70">✕</button>
        </p>
      )}
    </div>
  );
}
