import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  ["", "Overview"],
  ["bookings", "Bookings"],
  ["customers", "Customers"],
  ["services", "Services"],
  ["rewards", "Rewards"],
  ["reviews", "Reviews"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const active = loc.pathname.replace(/\/admin\/?/, "");

  return (
    <div className="min-h-screen bg-ivory font-body text-ink">
      <header className="border-b border-warmborder bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="font-display text-xl">Sundara · Admin</p>
          <p className="flex items-center gap-4 text-sm text-ink/60">
            <span>{user?.email}</span>
            <button
              onClick={() => { logout(); nav("/"); }}
              className="inline-flex min-h-[44px] items-center font-accent font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log out
            </button>
          </p>
        </div>
      </header>
      <nav aria-label="Admin sections" className="border-b border-warmborder bg-white px-4">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
          {TABS.map(([to, label]) => (
            <Link
              key={to}
              to={to ? `/admin/${to}` : "/admin"}
              aria-current={active === to ? "page" : undefined}
              className={`whitespace-nowrap px-4 py-3 font-accent text-sm font-semibold ${
                active === to ? "border-b-2 border-primary text-primary" : "text-ink/60 hover:text-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
