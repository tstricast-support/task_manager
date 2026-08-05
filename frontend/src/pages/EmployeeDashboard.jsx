import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import Header from "../components/Header";
import AddTaskForm from "../components/AddTaskForm";
import TaskRow from "../components/TaskRow";
import { useTaskSocket } from "../context/WebSocketContext";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [banner, setBanner] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { lastMessage } = useTaskSocket();

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks/me");
      setTasks(data);
      setError("");
    } catch {
      setError("Couldn't load your tasks. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Re-fetch whenever the admin assigns a new task in real time.
  useEffect(() => {
    if (lastMessage?.type === "TASK_ASSIGNED") {
      setBanner(`New task assigned: "${lastMessage.task?.title}"`);
      fetchTasks();
      const timer = setTimeout(() => setBanner(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage, fetchTasks]);

  async function handleAddTask(payload) {
    setAdding(true);
    try {
      const { data } = await api.post("/tasks", payload);
      setTasks((prev) => [data, ...prev]);
    } catch {
      setError("Couldn't add that task. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(task) {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTogglingId(task.id);
    try {
      const { data } = await api.patch(`/tasks/${task.id}/status`, {
        status: nextStatus,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
    } catch {
      setError("Couldn't update that task's status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteTask(task) {
  if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
  setDeletingId(task.id);
  try {
    await api.delete(`/tasks/${task.id}`);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  } catch {
    setError("Couldn't delete that task.");
  } finally {
    setDeletingId(null);
  }
}

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-10 pt-28 sm:px-6">
        <div className="mb-8">
          <p className="font-display text-xs uppercase tracking-widest text-ember-600">
            My workspace
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Your tasks
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {pendingCount === 0
              ? "Everything's marked done. Nice work."
              : `${pendingCount} task${pendingCount === 1 ? "" : "s"} still pending.`}
          </p>
        </div>

        {banner && (
          <div className="mb-6 rounded-md border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-800">
            {banner}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <AddTaskForm onSubmit={handleAddTask} submitting={adding} />
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-display text-base font-semibold">
            Task list
          </h2>
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-400">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">
              No tasks yet — add one above, or wait for one to be assigned.
            </p>
          ) : (
            <ul>
              {tasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onToggleStatus={handleToggleStatus}
                  toggling={togglingId === task.id}
                  onDelete={handleDeleteTask}
                  deleting={deletingId === task.id}
                />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
