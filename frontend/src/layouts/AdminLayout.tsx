import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Gift,
  LayoutDashboard,
  LogOut,
  Scissors,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/common/BrandLogo";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "", label: "Overview", icon: LayoutDashboard, hint: "Today's pulse" },
  { to: "bookings", label: "Bookings", icon: CalendarDays, hint: "All visits" },
  { to: "customers", label: "Customers", icon: Users, hint: "Guests & notes" },
  { to: "services", label: "Services", icon: Scissors, hint: "Menu & pricing" },
  { to: "rewards", label: "Rewards", icon: Gift, hint: "Glow catalogue" },
  { to: "reviews", label: "Reviews", icon: Star, hint: "Guest love" },
];

function initials(email: string | undefined): string {
  if (!email) return "A";
  const name = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  const parts = name.split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "A";
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const seg = loc.pathname.split("/")[2] ?? "";
  const activeTab = TABS.find((t) => t.to === seg) ?? TABS[0];

  function handleLogout() {
    logout();
    nav("/");
  }

  return (
    <div className="min-h-screen bg-ivory font-body text-ink lg:flex">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-primary text-ivory lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(184,111,120,0.35),transparent_70%)]"
        />
        <div className="relative px-6 pb-5 pt-7">
          <BrandLogo variant="light" size="sm" className="items-start" />
          <p className="mt-3 font-display text-2xl leading-tight">Atelier Ops</p>
          <p className="mt-1 text-[13px] text-ivory/60">Bookings, guests, glow &amp; revenue.</p>
        </div>
        <nav aria-label="Admin sections" className="relative flex-1 space-y-1 overflow-y-auto px-3">
          {TABS.map((t) => {
            const isActive = seg === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to ? `/admin/${t.to}` : "/admin"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors",
                  isActive ? "bg-white/12 text-white shadow-sm2" : "text-ivory/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive ? "bg-marigold text-white" : "bg-white/10 text-ivory/80 group-hover:bg-white/15"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block font-accent text-sm font-semibold leading-tight">{t.label}</span>
                  <span className={cn("block text-xs", isActive ? "text-white/70" : "text-ivory/50")}>{t.hint}</span>
                </span>
                {isActive && <span aria-hidden className="ml-auto h-6 w-1 rounded-pill bg-marigold-soft" />}
              </Link>
            );
          })}
        </nav>
        <div className="relative border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/8 px-3 py-2.5">
            <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-marigold-soft font-accent text-sm font-bold text-marigold-deep">
              {initials(user?.email)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">Studio Admin</span>
              <span className="block truncate text-xs text-ivory/60">{user?.email}</span>
            </span>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ivory/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---- Main column ---- */}
      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="border-b border-warmborder bg-white/90 px-4 pb-3 pt-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <BrandLogo size="sm" className="items-start" />
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-accent text-xs font-bold text-primary">
                {initials(user?.email)}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-pill border border-warmborder px-3.5 font-accent text-[13px] font-semibold text-ink/70"
              >
                <LogOut className="h-4 w-4" />
                Out
              </button>
            </div>
          </div>
          <nav aria-label="Admin sections" className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => {
              const isActive = seg === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to ? `/admin/${t.to}` : "/admin"}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 font-accent text-[13px] font-semibold",
                    isActive ? "border-primary bg-primary text-white" : "border-warmborder bg-white text-ink/65"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Desktop context bar */}
        <div className="hidden border-b border-warmborder bg-white/70 px-8 py-3 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-[13px] text-ink/55">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              <span className="mx-2 text-warmborder">|</span>
              <span className="font-semibold text-ink/75">{activeTab.label}</span>
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-pill bg-[#e3efe8] px-3 py-1 font-accent text-xs font-semibold text-leafgreen">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-leafgreen" />
              Studio live
            </p>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
