import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, id, className, ...rest }: Props) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-accent text-xs font-semibold tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "min-h-[44px] w-full rounded-sm2 border border-warmborder bg-white px-3.5 text-[15px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light",
          className
        )}
        {...rest}
      />
    </div>
  );
}
