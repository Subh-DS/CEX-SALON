import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  ["", "Dashboard"],
  ["schedule", "Schedule"],
  ["appointments", "Appointments"],
  ["customers", "Customers"],
  ["services", "Services"],
  ["loyalty", "Loyalty"],
  ["analytics", "Analytics"],
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const active = loc.pathname.replace(/\/staff\/?/, "").split("/")[0];
  const name = (user?.email ?? "staff").split("@")[0].replace(/^\w/, (c) => c.toUpperCase());

  function go(to: string) {
    setOpen(false);
    nav(to);
  }

  const links = (
    <>
      {TABS.map(([to, label]) => {
        const href = to ? `/staff/${to}` : "/staff";
        const isActive = active === to;
        return (
          <button
            key={to}
            onClick={() => go(href)}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[48px] w-full items-center px-5 font-accent text-[15px] font-semibold md:border-l-2 ${
              isActive
                ? "bg-white text-primary md:border-primary"
                : "text-ivory/70 hover:bg-white/5 hover:text-ivory md:border-transparent"
            }`}
          >
            {label}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-ivory font-body text-ink">
      <header className="bg-plum px-4 py-3 text-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="flex items-center gap-3">
            <button
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
            <Link to="/staff" className="font-display text-xl">Sundara · Staff</Link>
          </p>
          <p className="flex items-center gap-4 text-sm">
            <span className="hidden text-ivory/70 sm:inline">{name}</span>
            <button
              onClick={() => { logout(); nav("/"); }}
              className="inline-flex min-h-[44px] items-center font-accent font-semibold text-ivory/85 underline-offset-4 hover:text-ivory hover:underline"
            >
              Sign out
            </button>
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl md:flex md:gap-8 md:px-4 md:py-8">
        <nav aria-label="Staff sections" className="hidden w-56 shrink-0 md:block">
          <div className="overflow-hidden rounded-md2 bg-plum py-2">{links}</div>
          <p className="mt-3 px-2 text-[13px] text-ink/50">
            Weekly hours and time off live under <Link to="/staff/schedule" className="font-semibold text-primary underline-offset-4 hover:underline">Schedule</Link>.
          </p>
        </nav>
        {open && (
          <nav aria-label="Staff sections" className="border-b border-warmborder bg-plum md:hidden">
            <div className="py-2" role="menu">{links}</div>
          </nav>
        )}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-0 md:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
