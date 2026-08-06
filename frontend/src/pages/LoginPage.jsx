import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/img/logo.jpg";

export default function LoginPage() {
  const { login, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  if (isAuthenticated) {
    const redirectTo = location.state?.from || (isAdmin ? "/admin" : "/dashboard");
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      const user = await login(employeeId.trim(), password);
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white">
              <img src={logo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-bold">TRICAST HOLDING</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in with your employee ID.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(59,130,246,0.10) 0%, transparent 45%),
              radial-gradient(circle at 85% 10%, rgba(244,114,53,0.08) 0%, transparent 40%),
              radial-gradient(circle at 30% 90%, rgba(59,130,246,0.08) 0%, transparent 45%),
              radial-gradient(circle at 90% 80%, rgba(15,23,42,0.05) 0%, transparent 40%)
            `,
          }}
        >
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Employee ID
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="EMP101"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mb-4 w-full rounded-md border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400"
            required
          />

          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            required
          />

          {formError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="transition-base w-full rounded-md bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
