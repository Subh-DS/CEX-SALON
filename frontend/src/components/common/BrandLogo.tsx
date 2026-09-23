import { cn } from "@/lib/utils";

/**
 * The Blush Studio wordmark — stacked lockup matching the brand logo:
 *   THE
 *   BLUSH   (script-italic B, upright LUSH)
 *   — STUDIO —
 *
 * Renders in `currentColor`; callers set the tone, e.g.
 * `text-[#a2595f]` on light surfaces, `text-blushmist` on plum.
 */
export default function BrandLogo({
  variant = "dark",
  size = "md",
  className,
  label = "The Blush Studio",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const tones = {
    dark: "text-[#a2595f]",
    light: "text-[#f7e4e2]",
  } as const;

  const sizes = {
    sm: {
      the: "text-[9px] tracking-[0.5em]",
      blush: "text-[26px]",
      studio: "text-[9px] tracking-[0.42em]",
      line: "w-7",
      gap: "mt-0.5",
    },
    md: {
      the: "text-[11px] tracking-[0.55em]",
      blush: "text-4xl",
      studio: "text-[11px] tracking-[0.48em]",
      line: "w-10",
      gap: "mt-1",
    },
    lg: {
      the: "text-xs tracking-[0.6em]",
      blush: "text-5xl",
      studio: "text-xs tracking-[0.5em]",
      line: "w-14",
      gap: "mt-1.5",
    },
  } as const;

  const s = sizes[size];

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex select-none flex-col items-center leading-none", tones[variant], className)}
    >
      <span className={cn("font-accent font-medium", s.the)}>THE</span>
      <span className={cn("font-display", s.blush)}>
        <span className="font-medium italic">B</span>
        <span className="font-light tracking-[0.08em]">LUSH</span>
      </span>
      <span className={cn("flex items-center gap-2.5", s.gap)}>
        <span aria-hidden className={cn("h-px bg-current opacity-70", s.line)} />
        <span className={cn("font-accent font-medium", s.studio)}>STUDIO</span>
        <span aria-hidden className={cn("h-px bg-current opacity-70", s.line)} />
      </span>
    </span>
  );
}
