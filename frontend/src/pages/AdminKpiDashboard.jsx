import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/Header";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function kpiColor(pct) {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 50) return "text-ember-600";
  return "text-red-600";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminKpiDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchKpi = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/kpi-monthly", { params: { year, month } });
      setRows(data.sort((a, b) => b.on_time_percentage - a.on_time_percentage));
      setError("");
    } catch {
      setError("Couldn't load KPI data.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          ← Back to team overview
        </Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-ember-600">Admin</p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Monthly KPI</h1>
            <p className="mt-1 text-sm text-ink-500">On-time percentage per employee, for salary review.</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-md border border-ink-200 px-3 py-2 text-sm"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-md border border-ink-200 px-3 py-2 text-sm"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">No employees found.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const isOpen = expandedId === r.employee_id;
              return (
                <div key={r.employee_id} className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : r.employee_id)}
                    className="flex w-full items-center justify-between gap-2 sm:gap-4 px-5 py-4 text-left hover:bg-ink-50/60"
                  >
                    <div>
                      <p className="font-medium text-ink-900">{r.full_name}</p>
                      <p className="text-xs text-ink-400">{r.employee_id}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden text-emerald-700 sm:inline">{r.on_time_days} on time</span>
                        <span className="hidden text-red-600 sm:inline">{r.late_days} not on time</span>
                        <span className="hidden text-ink-400 sm:inline">{r.total_days} logged</span>
                        <span className={`text-base font-bold ${kpiColor(r.on_time_percentage)}`}>
                            {r.total_days === 0 ? "—" : `${r.on_time_percentage}%`}
                        </span>
                        <span className="text-ink-400">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                      {r.records.length === 0 ? (
                        <p className="py-4 text-center text-sm text-ink-400">
                          No KPI notes logged for this month.
                        </p>
                      ) : (
                        <ul className="divide-y divide-ink-100">
                          {r.records.map((rec) => (
                            <li key={rec.id} className="flex items-start gap-3 py-3">
                              <span
                                className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                  rec.outcome === "ON_TIME"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {rec.outcome === "ON_TIME" ? "On time" : "Not on time"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-ink-900">{formatDate(rec.entry_date)}</p>
                                {rec.note && <p className="mt-0.5 text-sm text-ink-500">{rec.note}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        to={`/admin/employee/${r.employee_id}`}
                        className="mt-2 inline-block text-xs font-medium text-secondary-600 hover:underline"
                      >
                        Go to employee profile →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}