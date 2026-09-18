import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/dashboard", label: "My Visits" },
  { to: "/loyalty", label: "Glow Points" },
];

function displayName(email: string): string {
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Guest";
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function onLogout() {
    logout();
    setOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="border-b border-ink/10 bg-ivory">
      <nav className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-6 px-4 md:px-6" aria-label="Primary">
        <Link to="/" className="leading-none">
          <span className="font-display text-[26px] font-semibold tracking-tight text-ink">Sundara</span>
          <span className="ml-2 font-devanagari text-base text-rose">सुन्दरा</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "font-accent text-[15px] text-ink/70 transition-colors hover:text-ink",
                  (isActive || (l.to !== "/" && pathname.startsWith(l.to))) && "font-semibold text-ink"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          {user ? (
            <>
              <Link
                to={user.role === "staff" ? "/staff" : user.role === "admin" ? "/admin" : "/dashboard"}
                className="flex items-center gap-2.5"
                aria-label="Your account"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm text-ivory" aria-hidden="true">
                  {displayName(user.email).charAt(0)}
                </span>
                <span className="font-accent text-[15px] font-medium text-ink">
                  {displayName(user.email)}
                </span>
              </Link>
              <button
                onClick={onLogout}
                className="font-accent text-sm text-ink/60 underline-offset-4 hover:text-ink hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="font-accent text-[15px] text-ink/70 hover:text-ink">
              Log in
            </Link>
          )}
          <Link
            to="/book"
            aria-current={pathname === "/book" ? "page" : undefined}
            className={`inline-flex min-h-[48px] items-center px-7 font-accent text-[15px] font-semibold transition-colors ${
              pathname === "/book"
                ? "bg-ivory text-primary outline outline-2 outline-primary"
                : "bg-primary text-ivory hover:bg-plum-deep"
            }`}
          >
            Book now
          </Link>
        </div>

        <button
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-ivory px-4 pb-6 pt-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-3 font-accent text-lg text-ink/80"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-4 border-t border-ink/10 pt-4">
            {user ? (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm text-ivory">
                  {displayName(user.email).charAt(0)}
                </span>
                <span className="flex-1 font-accent text-base">{displayName(user.email)}</span>
                <button onClick={onLogout} className="font-accent text-sm text-ink/60">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="font-accent text-base">
                Log in
              </Link>
            )}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[48px] items-center bg-primary px-7 font-accent text-[15px] font-semibold text-ivory"
            >
              Book now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
