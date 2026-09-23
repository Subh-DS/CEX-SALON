import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Page header ---------- */

export function AdminPageHeader({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="font-accent text-[11px] font-bold uppercase tracking-[0.22em] text-marigold-deep">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-ink md:text-4xl">
          {title}
        </h1>
        {sub && <p className="mt-1.5 text-[15px] leading-relaxed text-ink/60">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */

const STAT_TONES: Record<string, { icon: string; bar: string }> = {
  plum: { icon: "bg-primary/10 text-primary", bar: "from-primary to-primary-light" },
  rose: { icon: "bg-[#f6e7e1] text-marigold-deep", bar: "from-marigold-deep to-marigold" },
  leaf: { icon: "bg-[#e3efe8] text-leafgreen", bar: "from-leafgreen to-[#7fb08f]" },
  gold: { icon: "bg-[#f7efdc] text-[#9a6b1f]", bar: "from-[#c99a2e] to-[#e8c66a]" },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "plum",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof STAT_TONES;
}) {
  const t = STAT_TONES[tone];
  return (
    <div className="group relative overflow-hidden rounded-md2 border border-warmborder bg-white p-5 shadow-sm2 transition-shadow hover:shadow-md2">
      <div
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90", t.bar)}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="font-accent text-[11px] font-bold uppercase tracking-[0.14em] text-mutedbrown">
          {label}
        </p>
        <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", t.icon)}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-2 font-display text-[2rem] leading-none text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-[13px] text-ink/55">{sub}</p>}
    </div>
  );
}

/* ---------- Panel ---------- */

export function Panel({
  title,
  sub,
  action,
  children,
  className,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-md2 border border-warmborder bg-white p-5 shadow-sm2 md:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-sm text-ink/55">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------- Filter pill ---------- */

export function FilterPill({
  active,
  onClick,
  children,
  count,
  pressedLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  pressedLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={pressedLabel}
      className={cn(
        "inline-flex min-h-[40px] items-center gap-2 rounded-pill border px-4 font-accent text-[13px] font-semibold transition-all",
        active
          ? "border-primary bg-primary text-white shadow-sm2"
          : "border-warmborder bg-white text-ink/70 hover:border-primary-light hover:text-ink"
      )}
    >
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-pill px-1.5 text-[11px] font-bold",
            active ? "bg-white/20 text-white" : "bg-surfacewarm text-ink/60"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ---------- Search ---------- */

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative block min-w-[220px] flex-1 sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-pill border border-warmborder bg-white pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40"
      />
    </label>
  );
}

/* ---------- Table ---------- */

export function TableWrap({ children, minWidth = 760 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-md2 border border-warmborder bg-white shadow-sm2">
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0">
      <tr className="bg-surfacewarm text-left font-accent text-[11px] uppercase tracking-[0.1em] text-mutedbrown">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap px-4 py-3 font-semibold", className)}>{children}</th>;
}

/* ---------- States ---------- */

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-md2 border border-warmborder bg-white p-5">
          <div className="h-3 w-24 rounded bg-surfacewarm" />
          <div className="mt-3 h-8 w-28 rounded bg-surfacewarm" />
          <div className="mt-2 h-3 w-36 rounded bg-surfacewarm" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-md2 border border-warmborder bg-white" aria-hidden>
      <div className="h-11 bg-surfacewarm" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-t border-warmborder px-4 py-4">
          <div className="h-4 w-24 rounded bg-surfacewarm" />
          <div className="h-4 w-32 rounded bg-surfacewarm" />
          <div className="hidden h-4 flex-1 rounded bg-surfacewarm sm:block" />
          <div className="h-4 w-20 rounded bg-surfacewarm" />
        </div>
      ))}
    </div>
  );
}

export function AdminEmpty({
  icon: Icon = Inbox,
  title,
  sub,
}: {
  icon?: LucideIcon;
  title: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md2 border border-dashed border-warmborder bg-white/70 px-6 py-12 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surfacewarm text-ink/50">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <p className="mt-3 font-display text-xl text-ink">{title}</p>
      {sub && <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">{sub}</p>}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <p
      role="alert"
      className="flex flex-wrap items-center gap-2 rounded-md2 border border-[#efc9c9] bg-[#fdf1f1] px-4 py-3 text-sm text-[#8f2f2f]"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
      {onRetry && (
        <button onClick={onRetry} className="font-accent font-semibold underline underline-offset-4">
          Try again
        </button>
      )}
    </p>
  );
}

/* ---------- Form ---------- */

export const adminInputCls =
  "mt-1.5 min-h-[44px] w-full rounded-sm2 border border-warmborder bg-ivory/60 px-3.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light/40";

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="font-accent text-[13px] font-semibold text-ink">
      {children}
    </label>
  );
}
