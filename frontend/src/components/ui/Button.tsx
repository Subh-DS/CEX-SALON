import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-primary text-ivory hover:bg-plum-deep",
  secondary: "border border-primary text-primary hover:bg-marigold-soft",
  ghost: "border border-warmborder text-mutedbrown hover:border-primary-light",
};

export default function Button({ variant = "primary", className, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-pill px-6 font-accent text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
      {...rest}
    />
  );
}
