import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import PasswordField from "@/components/auth/PasswordField";

function roleHome(role: string): string {
  if (role === "staff") return "/staff";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

function friendlyError(err: unknown): string {
  const code = (err as { code?: string }).code;
  const message = (err as { message?: string }).message ?? "";
  if (code === "INVALID_CREDENTIALS") {
    return "That email or password doesn't look right. Please try again.";
  }
  if (message.includes("Failed to fetch") || message.includes("connect")) {
    return "We couldn't connect right now. Please try again.";
  }
  return message || "Something went wrong. Please try again.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function afterLogin(role: string) {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? roleHome(role), { replace: true });
  }

  async function signIn(emailValue: string, passwordValue: string) {
    setError(null);
    setBusy(true);
    try {
      const role = await login(emailValue, passwordValue);
      afterLogin(role);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter your password.");
      return;
    }
    signIn(email, password);
  }

  return (
    <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2">
      <div className="grid lg:grid-cols-2">
        {/* Brand panel: below the form on mobile, left on desktop */}
        <div className="order-2 lg:order-1">
          <AuthBrandPanel />
        </div>

        <motion.div
          className="order-1 flex items-center justify-center px-4 py-10 md:px-8 lg:order-2 lg:py-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-full max-w-sm">
            <h1 className="font-display text-[34px] font-medium tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[15px] text-ink/65">
              Sign in to manage your appointments and Glow Points.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate={false}>
              <div>
                <label htmlFor="email" className="mb-1.5 block font-accent text-[13px] font-semibold text-ink">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-[48px] w-full rounded-md border border-warmborder bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/50"
                />
              </div>

              <PasswordField
                value={password}
                onChange={setPassword}
                onForgot={() =>
                  setNotice("Password reset isn't available yet — call us at +91 674 000 0000 and we'll help you in.")
                }
              />

              {notice && (
                <p className="rounded-md border border-warmborder bg-surfacewarm px-3.5 py-2.5 text-sm text-ink/75">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-md bg-[#f7e8e8] px-3.5 py-2.5 text-sm text-[#b84444]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-[52px] w-full items-center justify-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory transition-colors hover:bg-plum-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Log in"}
              </button>
            </form>

            {import.meta.env.DEV && (
              <div className="mt-6 border-t border-ink/10 pt-5">
                <button
                  onClick={() => signIn("priya@example.com", "customer123")}
                  disabled={busy}
                  className="font-accent text-[15px] font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-60"
                >
                  Continue as demo
                </button>
                <p className="mt-1 text-[13px] text-ink/55">
                  Preview the customer experience without signing in.
                </p>
              </div>
            )}

            <p className="mt-6 text-[15px] text-ink/65">
              New to The Blush Studio?{" "}
              <Link to="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                Create an account →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
