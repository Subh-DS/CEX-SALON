import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PasswordField from "@/components/auth/PasswordField";

/** Staff entry point: same auth backend, role-gated. Staff → /staff, admin → /admin. */
export default function StaffLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user?.role === "staff") return <Navigate to="/staff" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const role = await login(email.trim(), password);
      if (role === "staff") nav("/staff", { replace: true });
      else if (role === "admin") nav("/admin", { replace: true });
      else setError("This sign-in is for salon staff. Customers, please use the main log in.");
    } catch {
      setError("We couldn't sign you in. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin() {
    setError(null);
    setBusy(true);
    try {
      await login("ananya@sundara.in", "staff1234");
      nav("/staff", { replace: true });
    } catch {
      setError("Demo sign-in isn't available right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">The Blush Studio · Staff</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink">Staff sign in</h1>
      <p className="mt-2 text-[15px] text-ink/60">For salon staff and managers. Your console opens after sign in.</p>
      <form onSubmit={submit} className="mt-6 rounded-md2 border border-warmborder bg-white p-6">
        <label className="block text-sm font-semibold text-ink">Work email
          <input
            type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 min-h-[48px] w-full border border-warmborder px-3.5 text-[15px] text-ink"
          />
        </label>
        <div className="mt-4">
          <PasswordField value={password} onChange={setPassword} onForgot={() => setError("Ask your salon manager to reset your password.")} />
        </div>
        {error && <p role="alert" className="mt-3 bg-[#f7e8e8] px-3 py-2 text-sm text-[#b84444]">{error}</p>}
        <button
          disabled={busy}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center bg-primary font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in to console"}
        </button>
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={demoLogin}
            disabled={busy}
            className="mt-2 inline-flex min-h-[48px] w-full items-center justify-center border border-warmborder font-accent text-sm font-semibold text-ink/70 hover:text-ink disabled:opacity-60"
          >
            Continue as demo staff
          </button>
        )}
      </form>
      <p className="mt-4 text-sm text-ink/55">
        Here to book an appointment? <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Customer log in</Link>
      </p>
    </div>
  );
}
