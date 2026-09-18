import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCustomers } from "@/api/admin";

export default function StaffCustomers() {
  const { data, isPending, isError, refetch } = useAdminCustomers();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? [])
      .filter(
        (c) =>
          !needle ||
          c.name.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle) ||
          (c.phone ?? "").includes(needle)
      )
      .slice()
      .sort((a, b) => b.bookings - a.bookings);
  }, [data, q]);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Customers</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, phone…"
        aria-label="Search customers"
        className="mt-4 min-h-[44px] w-full border border-warmborder bg-white px-3.5 text-[15px] text-ink sm:max-w-sm"
      />
      {isPending && <p className="mt-4 text-mutedbrown">Loading customers…</p>}
      {isError && (
        <p role="alert" className="mt-4 text-sm text-[#b84444]">
          We couldn&apos;t load customers. <button onClick={() => refetch()} className="underline">Try again</button>
        </p>
      )}
      {data && rows.length === 0 && <p className="mt-4 text-ink/60">No customers found.</p>}
      {rows.length > 0 && (
        <ul className="mt-4 divide-y divide-warmborder rounded-md2 border border-warmborder bg-white">
          {rows.map((c) => (
            <li key={c.id}>
              <Link to={`/staff/customers/${c.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-ivory">
                <span>
                  <b className="text-ink">{c.name}</b>
                  <span className="block text-[13px] text-ink/55">{c.email}</span>
                </span>
                <span className="ml-auto text-sm text-ink/60">
                  {c.bookings} visit{c.bookings === 1 ? "" : "s"} · {c.points} pts{c.tier ? ` · ${c.tier}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
