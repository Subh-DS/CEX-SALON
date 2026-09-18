import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  value,
  onChange,
  onForgot,
}: {
  value: string;
  onChange: (v: string) => void;
  onForgot: () => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor="password" className="font-accent text-[13px] font-semibold text-ink">
          Password
        </label>
        <button
          type="button"
          onClick={onForgot}
          className="font-accent text-[13px] text-ink/60 underline-offset-4 hover:text-primary hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <div className="relative">
        <input
          id="password"
          type={visible ? "text" : "password"}
          required
          autoComplete="current-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your password"
          className="min-h-[48px] w-full rounded-md border border-warmborder bg-white px-3.5 pr-12 text-[15px] text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/50"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center text-ink/50 hover:text-ink"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
