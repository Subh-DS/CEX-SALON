import { Link } from "react-router-dom";
import { useServices, useStaff } from "@/api/bookings";
import { serviceImage, staffImage } from "@/data/images";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/utils";

export default function StaffServices() {
  const { user } = useAuth();
  const services = useServices();
  const staff = useStaff(null);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Services & team</h1>
        {user?.role === "admin" && (
          <Link to="/admin/services" className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Manage in Admin →
          </Link>
        )}
      </div>
      <p className="mt-1 text-[15px] text-ink/60">
        The same menu customers book from — no separate copies.
      </p>

      <h2 className="mt-6 font-display text-xl text-ink">Menu</h2>
      {services.isPending && <p className="mt-2 text-mutedbrown">Loading menu…</p>}
      <ul className="mt-2 divide-y divide-warmborder rounded-md2 border border-warmborder bg-white">
        {(services.data ?? []).map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <img src={serviceImage(s)} alt="" className="h-10 w-14 rounded-[4px] object-cover" loading="lazy" />
            <span>
              <b className="text-ink">{s.name}</b>
              <span className="block text-[13px] text-ink/55">{s.category} · {s.duration_minutes} min · {formatINR(s.price)}</span>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 font-display text-xl text-ink">Team</h2>
      {staff.isPending && <p className="mt-2 text-mutedbrown">Loading team…</p>}
      <ul className="mt-2 divide-y divide-warmborder rounded-md2 border border-warmborder bg-white">
        {(staff.data ?? []).map((st) => (
          <li key={st.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <img src={staffImage(st)} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
            <span>
              <b className="text-ink">{st.name}</b>
              <span className="block text-[13px] text-ink/55">
                {st.specialties.join(" · ")} · ★ {st.rating} ({st.review_count}) · {st.experience_years} yrs
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
