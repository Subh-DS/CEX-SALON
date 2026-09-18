import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["Service", "Expert", "Date", "Time", "Review", "Pay"] as const;

export const STEP_HEADINGS = [
  "Choose your service",
  "Choose your expert",
  "Choose a date",
  "Choose a time",
  "Review your appointment",
  "Complete payment",
] as const;

export default function Stepper({ current }: { current: number }) {
  return (
    <ol className="hidden items-start lg:flex" aria-label="Booking progress">
      {BOOKING_STEPS.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={label}
            aria-current={now ? "step" : undefined}
            className={cn(
              "relative flex-1 text-center font-accent",
              now ? "text-ink" : done ? "text-ink/80" : "text-ink/40"
            )}
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[-50%] top-[15px] h-[2px] w-full",
                  done || now ? "bg-primary" : "bg-ink/15"
                )}
              />
            )}
            <span
              className={cn(
                "relative mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-ivory text-[13px] font-bold",
                done && "border-primary bg-primary text-ivory",
                now && "border-primary text-primary",
                !done && !now && "border-ink/20 text-ink/40"
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={cn("text-[13px]", now ? "font-bold" : "font-medium")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
