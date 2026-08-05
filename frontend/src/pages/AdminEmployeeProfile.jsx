import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/Header";
import TaskRow from "../components/TaskRow";
import AssignTaskModal from "../components/AssignTaskModal";
import AddKpiNoteModal from "../components/AddKpiNoteModal";

export default function AdminEmployeeProfile() {
  const { id: employeeId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [kpiRecords, setKpiRecords] = useState([]);
  const [kpiLoading, setKpiLoading] = useState(true);

const now = new Date();
const [kpiYear] = useState(now.getFullYear());
const [kpiMonth] = useState(now.getMonth() + 1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/employees/${employeeId}/tasks`);
      setTasks(data);
      setError("");
    } catch {
      setError("Couldn't load this employee's tasks.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

 const fetchKpi = useCallback(async () => {
  setKpiLoading(true);
  try {
    const { data } = await api.get(`/admin/employees/${employeeId}/kpi-monthly`, {
      params: { year: kpiYear, month: kpiMonth },
    });
    setKpiRecords(data.records);
  } catch {
    // silently ignore — the task list error banner already covers connectivity issues
  } finally {
    setKpiLoading(false);
  }
}, [employeeId, kpiYear, kpiMonth]);

useEffect(() => {
  fetchKpi();
}, [fetchKpi]);

  async function handleAssign(payload) {
    await api.post("/admin/assign-task", payload);
    setSuccessBanner("Task assigned.");
    fetchTasks();
    setTimeout(() => setSuccessBanner(""), 5000);
  }

  async function handleAddKpiNote(payload) {
  await api.post(`/admin/employees/${employeeId}/kpi-notes`, payload);
  setSuccessBanner("KPI note added.");
  fetchKpi();
  setTimeout(() => setSuccessBanner(""), 5000);
}

  async function handleDeleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setDeletingId(task.id);
    try {
      await api.delete(`/admin/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch {
      setError("Couldn't delete that task.");
    } finally {
      setDeletingId(null);
    }
  }

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-10 pt-28 sm:px-6">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          ← Back to team overview
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-ember-600">
              Employee profile
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{employeeId}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {tasks.length} task{tasks.length === 1 ? "" : "s"} · {completedCount} completed
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKpiModalOpen(true)}
              className="transition-base flex-1 rounded-md border border-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-paper sm:flex-none"
            >
              + KPI note
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="transition-base flex-1 rounded-md border border-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-paper sm:flex-none"
            >
              + Assign task
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successBanner}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-400">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">
              No tasks assigned to this employee yet.
            </p>
          ) : (
            <ul>
              {tasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onToggleStatus={() => {}}
                  toggling={false}
                  onDelete={handleDeleteTask}
                  deleting={deletingId === task.id}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-display text-base font-semibold">
            KPI notes — this month
          </h2>
          {kpiLoading ? (
            <p className="py-6 text-center text-sm text-ink-400">Loading…</p>
          ) : kpiRecords.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">
              No KPI notes logged yet this month.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {kpiRecords.map((rec) => (
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
                    <p className="text-sm font-medium text-ink-900">
                      {new Date(rec.entry_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {rec.note && <p className="mt-0.5 text-sm text-ink-500">{rec.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        


      </main>

      {modalOpen && (
        <AssignTaskModal presetEmployeeId={employeeId} onClose={() => setModalOpen(false)} onAssign={handleAssign} />
      )}

      {kpiModalOpen && (
        <AddKpiNoteModal
          employeeId={employeeId}
          onClose={() => setKpiModalOpen(false)}
          onAdd={handleAddKpiNote}
        />
      )}
    </div>
  );
}