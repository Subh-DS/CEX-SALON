import { cn } from "@/lib/utils";

type Tone = "confirmed" | "gold" | "muted" | "error";

const tones: Record<Tone, string> = {
  confirmed: "bg-[#e3efe8] text-leafgreen",
  gold: "bg-[#f6e7e1] text-primary",
  muted: "bg-surfacewarm text-mutedbrown border border-warmborder",
  error: "bg-[#f7e8e8] text-[#b84444]",
};

export default function Badge({
  tone = "muted",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center rounded-pill px-3 font-accent text-xs font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
