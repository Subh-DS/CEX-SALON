import { useMemo, useState } from "react";
import { CalendarSearch } from "lucide-react";
import { useAdminBookings } from "@/api/admin";
import Badge from "@/components/ui/Badge";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";
import {
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  FilterPill,
  SearchInput,
  SkeletonTable,
  TableHead,
  TableWrap,
  Th,
} from "@/components/admin/AdminUI";

const FILTERS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminBookings() {
  const { data, isPending, isError, refetch } = useAdminBookings();
  const [f, setF] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const all = data ?? [];
    const m: Record<Filter, number> = { all: all.length, pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 };
    for (const b of all) {
      if (b.status in m) m[b.status as Exclude<Filter, "all">] += 1;
    }
    return m;
  }, [data]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? [])
      .filter((b) => f === "all" || b.status === f)
      .filter((b) => {
        if (!needle) return true;
        const item = b.items[0];
        return [b.booking_number, b.customer_name ?? "", item?.service_name ?? "", item?.staff_name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });
  }, [data, f, q]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Diary"
        title="Bookings"
        sub={`${counts.all} visits across every expert and ritual.`}
      />

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          {FILTERS.map((s) => (
            <FilterPill
              key={s}
              active={f === s}
              count={counts[s]}
              onClick={() => setF(s)}
              pressedLabel={`Show ${s.replace("_", " ")} bookings`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </FilterPill>
          ))}
        </div>
        <SearchInput value={q} onChange={setQ} label="Search bookings" placeholder="Search booking no., guest, ritual, expert…" />
      </div>

      <div className="mt-4">
        {isPending && <SkeletonTable />}
        {isError && <AdminError message="We couldn't load bookings." onRetry={() => refetch()} />}
        {!isPending && !isError && rows.length === 0 && (
          <AdminEmpty
            icon={CalendarSearch}
            title={q ? "No bookings match your search" : "No bookings with this status"}
            sub={q ? "Try a different name, ritual or booking number." : "New visits will land here as guests book."}
          />
        )}
        {rows.length > 0 && (
          <>
            <p className="mb-2 text-[13px] text-ink/55" aria-live="polite">
              Showing <b className="text-ink">{rows.length}</b> booking{rows.length === 1 ? "" : "s"}
            </p>
            <TableWrap>
              <TableHead>
                <Th>Booking</Th>
                <Th>When</Th>
                <Th>Guest</Th>
                <Th>Ritual · Expert</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </TableHead>
              <tbody>
                {rows.map((b) => {
                  const item = b.items[0];
                  const d = item ? parseVisitDate(item.start_time) : null;
                  return (
                    <tr key={b.id} className="border-t border-warmborder/70 transition-colors hover:bg-ivory/70">
                      <td className="px-4 py-3.5">
                        <span className="font-accent text-sm font-bold text-ink">{b.booking_number}</span>
                        {b.items.length > 1 && (
                          <span className="ml-2 rounded-pill bg-surfacewarm px-2 py-0.5 text-[11px] font-semibold text-ink/55">
                            +{b.items.length - 1} more
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-ink/70">
                        {d ? (
                          <>
                            <b className="text-ink">{d.month} {d.day}</b>
                            <span className="text-ink/50"> · {d.time}</span>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-ink">{b.customer_name ?? "—"}</span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5 text-ink/70">
                        {item ? (
                          <>
                            <span className="block truncate font-medium text-ink/80">{item.service_name}</span>
                            <span className="text-[13px] text-ink/50">with {item.staff_name}</span>
                          </>
                        ) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="font-semibold text-ink">{formatINR(b.total_amount)}</span>{" "}
                        <Badge tone={b.paid ? "confirmed" : "muted"}>{b.paid ? "Paid" : "Unpaid"}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <VisitStatus status={b.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </>
        )}
      </div>
    </div>
  );
}
